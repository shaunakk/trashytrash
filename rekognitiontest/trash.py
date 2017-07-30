import requests
import boto3
import pprint


def evaluate_url(url):
	rek = boto3.client('rekognition')

	resp = requests.get(url)
	imgbytes = resp.content

	rekresp = rek.detect_labels(Image={'Bytes': imgbytes})

	return rekresp['Labels']