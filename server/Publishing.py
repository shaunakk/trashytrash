from __future__ import print_function

import time

from satori.rtm.client import make_client

endpoint = "wss://nk635fwl.api.satori.com"
appkey = "E1927d5B8DA276fBaD4486DD6cDc7FBF"


def main():
    with make_client(endpoint=endpoint, appkey=appkey) as client:
        print('Connected to Satori RTM!')

        while True:

            def on_publish_ack(pdu):
                if pdu['action'] == 'rtm/publish/ok':
                    print('Publish confirmed')
                else:
                    print(
                        'Failed to publish. '
                        'RTM replied with the error {0}: {1}'.format(
                            pdu['body']['error'], pdu['body']['reason']))

            message = {"where": [-122.32503706914497, 37.56375471196111]}
            client.publish("trash", message, callback=on_publish_ack)

            time.sleep(.01)


if __name__ == '__main__':
    main()
