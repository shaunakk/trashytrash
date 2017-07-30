from __future__ import print_function

from satori.rtm.client import make_client

endpoint = "wss://nk635fwl.api.satori.com"
appkey = "E1927d5B8DA276fBaD4486DD6cDc7FBF"


def lambda_handler(event, context):
    with make_client(endpoint=endpoint, appkey=appkey) as client:
        print('Connected to Satori RTM!')

        def on_publish_ack(pdu):
            if pdu['action'] == 'rtm/publish/ok':
                print('Publish confirmed')
            else:
                print(
                    'Failed to publish. '
                    'RTM replied with the error {0}: {1}'.format(
                        pdu['body']['error'], pdu['body']['reason']))

        message = {"lon": event['lon'], "lat": event['lat'], "diff": event['diff'], "image_url": event["image_url"], "labels": event["labels"], "pollution": event["pollution"]}
        client.publish("trash", message, callback=on_publish_ack)
