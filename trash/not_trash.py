from __future__ import print_function

import requests

import boto3


import json

#from satori.rtm.client import make_client

#endpoint = "wss://nk635fwl.api.satori.com"
#appkey = "E1927d5B8DA276fBaD4486DD6cDc7FBF"

keywords = ["Trash", "Bottle", "Can", "Rubble", "Tin", "Paper", "Plastic"]

def filter(labels):
    res = []
    for l in labels:
        if l["Name"] in keywords:
            res.append(l["Name"])
    return res

def getMax(labels):
    max = float(0)
    for l in labels:
        value = float(l["Confidence"])
        if value > max:
            max = value
    return max


def handle(event, context):
#    with make_client(endpoint=endpoint, appkey=appkey) as client:
    client = boto3.client('lambda',
        aws_access_key_id='AKIAIZHWGMO4BYFIPAAQ',
        aws_secret_access_key='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')
    rek = boto3.client('rekognition',
        aws_access_key_id='AKIAIZHWGMO4BYFIPAAQ',
        aws_secret_access_key='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')

    resp = requests.get(event['image_url'])

    imgbytes = resp.content

    rekresp = rek.detect_labels(Image={'Bytes': imgbytes})

    labels = filter(rekresp["Labels"])
    maximum = getMax(rekresp["Labels"])

    d = {
        "image_url": event["image_url"],
        "labels": labels,
        "lon": event["lon"],
        "lat": event["lat"],
        "diff": event["diff"],
        "pollution": str(maximum)
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
