

from os import environ
from random import randint
import asyncio

from autobahn.asyncio.wamp import ApplicationSession, ApplicationRunner


import pymongo

client = pymongo.MongoClient('mongodb://mongo:27017', connect=False)
db = client.wolf



class Wolf(ApplicationSession):
	"""
	An application component that publishes events with no payload
	and with complex payload every second.
	"""
	#serial = Serial(port=, baudrate=,)

	async def onJoin(self, details):
		print("session attached")
		# def ping(pong):
		# 	return("pong ", pong)

        def getAnnotations(user, song):
            return db.annotations.find({'user': user})

		await self.register(ping, u'local.wolf.getAnnotations')

        def saveAnnotations(user, ann):
            return
        def getAuthUsers(user):
            users = []
            db.authUsers.find()
            return

		while True:
			# print("publish: local.harpro.heartbeat", counter)
			# self.publish(u'local.harpro.heartbeat', counter)

			# await asyncio.sleep(1)

	def onDisconnect(self):
		asyncio.get_event_loop().stop()

if __name__ == '__main__':
	runner = ApplicationRunner(environ.get("AUTOBAHN_DEMO_ROUTER", u"ws://127.0.0.1:7777/ws"), u"realm1",)
	runner.run(Wolf)
