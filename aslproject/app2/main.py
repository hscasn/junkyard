# -*- coding: utf-8 -*-

# Copyright 2017 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


import json
import os
import numpy as np

from flask import Flask
from flask import jsonify
from flask import render_template
from flask import request
from flask import url_for
from googleapiclient import discovery
from oauth2client.client import GoogleCredentials
from tensorflow.keras.applications.resnet50 import preprocess_input as preprocess_resnet50
import tensorflow as tf
import requests
from tensorflow.keras.preprocessing import image



# from google.appengine.api import app_identity


credentials = GoogleCredentials.get_application_default()
api = discovery.build('ml', 'v1', credentials=credentials)
# project = app_identity.get_application_id()
project='qwiklabs-gcp-3f19cbba7aa3ae63'
model_name = os.getenv('MODEL_NAME', 'image_classification')
desc_version = os.getenv('DESC_VERSION', 'description_model')
img_version = os.getenv('IMG_VERSION', 'v1')


app = Flask(__name__)

CLASSES_LIST = ['Bras', 'Ties', 'Tops', 'Jeans', 'Polos', 'Rings', 'Socks',
       'Skirts', 'Watches', 'Leggings', 'Sweaters', 'T-Shirts',
       'Necklaces', 'Swim Tops', 'Underwear', 'Fragrances', 'Range Hoods',
       'Basins/Sinks', 'Button-Downs', 'Slacks/Pants', 'Swim Bottoms',
       'Jackets/Coats', 'Office Chairs', 'Gloves/Mittens',
       'Semi-Brim Hats', 'Dresses & Gowns', 'Pendants & Charms',
       'Blazers/Suit Coats', 'Swim Variety Packs', 'Bracelets & Anklets',
       'One-Piece Swimsuits', 'Protective Footwear',
       'Faucets/Taps/Handles', 'Bedding Variety Packs',
       'Earrings & Ear Jewelry', 'Protective/Active Tops',
       'Cardigans/Kimonos/Wraps', 'Everyday/Dress Footwear',
       'Protective/Active Pants', 'Protective/Active Vests',
       'Tableware Variety Packs', 'Active/Athletic Footwear',
       'Protective/Active Shorts', 'Specialty Sport Footwear',
       'Hair Cleaning & Treatments', 'Business/Formal Dress Suits',
       'Sweatshirts/Fleece Pullovers', 'Clothing Sets & Variety Packs',
       'Protective/Active Button-Downs',
       'Vitamins, Minerals, & Dietary Supplements']


def get_prediction(features, version_name):
  input_data = {'instances': features['input']}
  parent = 'projects/%s/models/%s/versions/%s' % (project, model_name, version_name)
  prediction = api.projects().predict(body=input_data, name=parent).execute()
  return prediction[u'predictions'][0][u'dense_1']

@app.route('/')
def index():
  return render_template('index.html')


@app.route('/form')
def input_form():
  return render_template('form.html')


@app.route('/api/predict', methods=['POST'])
def predict():
  data = json.loads(request.data.decode('utf8'))
  mandatory_items = []
  for item in mandatory_items:
    if item not in data.keys():
      return jsonify({'result': 'Set all items.'})

  features = {}
  version_name = ''
  if 'description' in data.keys():
    features['input'] = data['description']
    version_name = desc_version
  else:
    image_url = data['image_url']
    image = preprocess(image_url)
    images = [image]
    for img in images:
        data=json.dumps({'input_3':img.tolist()})
    features['input'] = data
    version_name = img_version

  #features['key'] = 'nokey'
  #features['product_id'] = str(data['product_id'])
#   features['product_name'] = data['product_name']
#   features['image_url'] = data['image_url']
  #features['description'] = str(data['description'])
  #prediction = get_prediction(features)

  prediction = get_prediction(features,version_name)


  max_prediction = -float("inf")
  prediction_class = ''
  for i in range(len(prediction)):
      if prediction[i] > max_prediction:
          max_prediction = prediction[i]
          prediction_class = CLASSES_LIST[i]

  return jsonify({'result': prediction_class})

  #return jsonify({'result': '{:.2f} lbs.'.format(prediction)})
    
def preprocess(image_url):
#     res = requests.get(image_url)
#     image_bytes = res.content
    # Decode the image, end up with pixel values that are in the -1, 1 range
    img = image.load_img(image_url, target_size=(224, 224))
    img = image.img_to_array(img)
    img = np.expand_dims(img, axis=0)
    img = preprocess_resnet50(img)
    return img