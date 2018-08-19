
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
client = None
db = None

@retry(Exception, tries=5, delay=2)
def dbConnect():
	client = pymongo.MongoClient('mongodb://mongo:27017', connect=False)
	db = client.wolf
	sys.stdout.write("wolf connected to mongo!\n")

dbConnect()
#
# try:
# 	dbConnect()
# except Exception as e:
# 	sys.stdout.write("mongo connection failed\n")
# 	sys.stderr.write(e)
# 	sleep(1)





class Wolf(ApplicationSession):
	"""
	An application component that publishes events with no payload
	and with complex payload every second.
	"""
	#serial = Serial(port=, baudrate=,)

	async def onJoin(self, details):
		sys.stdout.write("session attached")
		heartbeats = 0
		# def ping(pong):
		# 	return("pong ", pong)

		def getAnnotations(): # (user, song):
			# db.annotations.find({'user': user})
			return 'annotation'
		await self.register(getAnnotations, u'local.wolf.getAnnotations')

		def saveAnnotations(user, ann):
			return
		def getAuthUsers(user):
			users = []
			db.authUsers.find()
			return

		while True:
			sys.stdout.write("publish: local.wolf.heartbeat {}{}".format( heartbeats, "\n"))
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
