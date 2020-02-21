from tensorflow.keras.applications.resnet50 import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input, decode_predictions
import tensorflow.keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Reshape, Input
from tensorflow.keras.layers import Dense, Dropout, Activation, Flatten
from tensorflow.keras.layers import Conv2D, MaxPooling2D
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.regularizers import l2
from tensorflow.keras.layers import average 

import tensorflow as tf
import numpy as np

LIST_OF_LABELS = ['Bras', 'Ties', 'Tops', 'Jeans', 'Polos', 'Rings', 'Socks',
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

# For image classification
HEIGHT = 224
WIDTH = 224
NUM_CHANNELS = 3
NCLASSES = 50


# For image classification
def read_and_preprocess(image_bytes, bucket_name=None, product_name=None, description=None,label_ix=None, augment=False, pretrained=False):
    # Decode the image, end up with pixel values that are in the -1, 1 range
    image = tf.image.decode_jpeg(contents = image_bytes, channels=NUM_CHANNELS)
    image = tf.expand_dims(input = image, axis = 0) # resize_bilinear needs batches

    if augment:
        image = tf.image.resize_bilinear(images = image, size = [HEIGHT+10, WIDTH+10], align_corners = False)
        image = tf.squeeze(input = image, axis = 0) # remove batch dimension
        image = tf.random_crop(value = image, size = [HEIGHT, WIDTH, NUM_CHANNELS])
        image = tf.image.random_flip_left_right(image = image)
        image = tf.image.random_brightness(image = image, max_delta = 63.0/255.0)
        image = tf.image.random_contrast(image = image, lower = 0.2, upper = 1.8)
    else:
        image = tf.image.resize_bilinear(images = image, size = [HEIGHT, WIDTH], align_corners = False)
        image = tf.squeeze(input = image, axis = 0) #remove batch dimension

    # Pixel values are in range [0,1], convert to [-1,1]
    if pretrained:
        image = preprocess(image)
    else:
        image = tf.image.convert_image_dtype(image = image, dtype = tf.float32) # 0-1
        image = tf.subtract(x = image, y = 0.5)
        image = tf.multiply(x = image, y = 2.0)

    return image, tf.one_hot(label_ix, 50)
    return {'imagem':image}, bucket_name

# For image classification
def make_input_fn(csv_of_filenames, batch_size, mode, augment = False, pretrained = False):
    def decode_csv(csv_row):
        bucket_name, product_id, product_name, description,label_ix = tf.decode_csv(
            records = csv_row,
            record_defaults = [[''],[''],[''],[''], [0]],
            use_quote_delim=True)
        image_bytes = tf.read_file(filename = product_id)
        return image_bytes, bucket_name, product_name, description,label_ix

    # Create tf.data.dataset from filename
    dataset = tf.data.TextLineDataset(filenames = csv_of_filenames).skip(1).map(map_func = decode_csv)     

    if augment: 
        dataset = dataset.map(map_func = read_and_preprocess_with_augment)
    else:
        dataset = dataset.map(map_func = read_and_preprocess)

    if mode == tf.estimator.ModeKeys.TRAIN:
        num_epochs = 10
        # indefinitely
        dataset = dataset.shuffle(buffer_size = 10 * batch_size)
    else:
        num_epochs = 1 # end-of-input after this

    dataset = dataset.repeat(count = num_epochs).batch(batch_size = batch_size)
    return dataset


# For image classification
def train_model(output_dir, hparams):
    train_input_fn = make_input_fn(hparams['train_data_path'], 100, tf.estimator.ModeKeys.TRAIN, pretrained=hparams['pretrained'])
    eval_input_fn = make_input_fn(hparams['eval_data_path'], 100, tf.estimator.ModeKeys.EVAL, pretrained=hparams['pretrained'])
    
    # connect new layers to the output
    res_model = ResNet50(weights='imagenet')
    x = res_model.output

    # let's add a fully-connected layer
    x = Dense(1024, activation='relu',kernel_initializer='he_uniform')(x)
    # and a fully connected layer 
    predictions = Dense(50, activation='softmax', kernel_initializer='glorot_uniform')(x)

    Res50 = tf.keras.Model(inputs=res_model.input, outputs=predictions)

    # freeze ResNet during training
    for layer in res_model.layers:
        layer.trainable = False

    Res50.compile(optimizer='adam', loss='categorical_crossentropy',metrics=['accuracy'])

    Res50.fit(train_input_fn,
              validation_data=eval_input_fn,
              epochs=10,
              validation_steps=1,
              steps_per_epoch=300)