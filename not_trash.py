from __future__ import print_function

import requests

import boto3


import json 

#from satori.rtm.client import make_client

#endpoint = "wss://nk635fwl.api.satori.com"
#appkey = "E1927d5B8DA276fBaD4486DD6cDc7FBF"


def handle(event, context):
#    with make_client(endpoint=endpoint, appkey=appkey) as client:
    client = boto3.client('lambda',
        aws_access_key_id='AKIAIEKJQJLM4KPXAC3Q',
        aws_secret_access_key='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')
    rek = boto3.client('rekognition',
        aws_access_key_id='AKIAIEKJQJLM4KPXAC3Q',
        aws_secret_access_key='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')

    resp = requests.get(event['image_url'])

    imgbytes = resp.content

    rekresp = rek.detect_labels(Image={'Bytes': imgbytes})

    d = {
        "image_url": event["image_url"],
        "label": rekresp['Labels'],
        "lon": event["lon"],
        "lat": event["lat"],
        "diff": event["diff"]
    }
    


    load = json.dumps(d)


    response = client.invoke(
        #ClientContext='MyApp',
        FunctionName='Satori',
        InvocationType='RequestResponse',
        LogType='Tail',
        Payload= load
        #Qualifier='1',
    )
