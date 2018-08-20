
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
			res = []
			cur = self.db.annotations.find({'song': song, 'user': user})
			for c in cur:
				res.append(str(c))

			sys.stdout.write("getAnnotations \n".format(res))
			return res
		await self.register(getAnnotations, u'local.wolf.getAnnotations')

		def saveAnnotations(song, user, ann):
			result = self.db.annotations.update({'song': song, 'user': user}, {'$set':{'file': ann}}, upsert=True)
			sys.stdout.write("saveAnnotations {}\n".format(result))
			return
		await self.register(saveAnnotations, u'local.wolf.saveAnnotations')

		def getAuthUsers(user):
			return self.db.authorizations.find({'user':user})
		await self.register(getAuthUsers, u'local.wolf.getAuthUsers')

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
