
# import logging as log
import sys
from os import environ
from random import randint
import asyncio
# from time import sleep
from retry import retry

from autobahn.asyncio.wamp import ApplicationSession, ApplicationRunner
sys.stdout.write("wolf started\n")

import pymongo


class Wolf(ApplicationSession):
	client = None
	db = None

	@retry(Exception, tries=5, delay=2)
	def dbConnect(self):
		self.client = pymongo.MongoClient('mongodb://mongo:27017', connect=False)
		self.db = self.client.wolf
		sys.stdout.write("wolf connected to mongo!\n")

	async def onJoin(self, details):
		sys.stdout.write("session attached\n")
		heartbeats = 0
		# def ping(pong):
		# 	return("pong ", pong)
		self.dbConnect()

		def getAnnotations(song, user):
			result = []
			cur = self.db.annotations.find({'song': song, 'user': user})
			for c in cur:
				result.append(c['file'])
			sys.stdout.write("getAnnotations user: {}, song: {}, result: {} \n".format(user, song, result))

			return result
		await self.register(getAnnotations, u'local.wolf.getAnnotations')

		def saveAnnotations(song, user, ann):
			result = self.db.annotations.update({'song': song, 'user': user}, {'$set':{'file': ann}}, upsert=True)
			sys.stdout.write("saveAnnotations user: {}, song: {}, result: {}\n".format(user, song, result))
			return str(result)
		await self.register(saveAnnotations, u'local.wolf.saveAnnotations')

		def authUser(author, authee):
			result = self.db.authorizations.update({'user':author}, {'$addToSet':{'authorized':authee}}, upsert=True)
			sys.stdout.write("{} authorized {} with {} \n".format(author, authee, result))
			return str(result)
		await self.register(authUser, u'local.wolf.authUser')

		def deAuthUser(author, authee):
			result = self.db.authorizations.update({'user':author}, {'$pull':{'authorized':authee}})
			sys.stdout.write("{} deAuthorized {} with {} \n".format(author, authee, result))
			return str(result)
		await self.register(deAuthUser, u'local.wolf.deAuthUser')

		def getAuthUsers(user):
			result = self.db.authorizations.find_one({'user':user}, projection=['authorized'])
			if result is not None:
				result = str(result['authorized'])
			sys.stdout.write("{} has authorized {} \n".format(user, result))
			return result
		await self.register(getAuthUsers, u'local.wolf.getAuthUsers')

		def defaultSong():
			return "The-Bebop-Bible.pdf"
		await self.register(defaultSong, u'local.conductor.songURL')

		def getSetlist():
			result = self.db.setlists.find()[0]
			return result
		await self.register(getSetlist, u'local.conductor.setlist')

		def saveSetlist(name, setlist):
			result = self.db.setlists.update( { 'name' : name, 'setlist' : setlist } )
			return str(result)
		await self.register(saveSetlist, u'local.wolf.saveSetlist')

		while True:
			# sys.stdout.write("publish: local.wolf.heartbeat {}{}".format( heartbeats, "\n"))
			self.publish(u'local.wolf.heartbeat', heartbeats)
			heartbeats += 1
			await asyncio.sleep(1)

	def onDisconnect(self):
		asyncio.get_event_loop().stop()

@retry(Exception, tries=5, delay=2)
def cbConnect():
	runner = ApplicationRunner(environ.get("AUTOBAHN_DEMO_ROUTER", u"ws://leo:7777/ws"), u"realm1",)
	runner.run(Wolf)
	sys.stdout.write("wolf connected to crossbar!\n")

if __name__ == '__main__':
	cbConnect()
