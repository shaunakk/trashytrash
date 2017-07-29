import pprint

import boto3

if __name__ == '__main__':
    client = boto3.client('rekognition')

    with open('drive_resized.jpg', 'rb') as source_image:
        source_bytes = source_image.read()
        
    response = client.detect_faces(
                    Image={ 'Bytes': source_bytes },
                    Attributes=[ 'ALL' ]
    )

pprint.pprint(response)