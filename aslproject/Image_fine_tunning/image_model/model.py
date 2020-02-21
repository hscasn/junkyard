from tensorflow.python.keras.preprocessing import text
from tensorflow.python.keras import models
#from tensorflow.python.keras.layers import Dense
#from tensorflow.python.keras.layers import Dropout
from tensorflow.python.keras.layers import Embedding
from tensorflow.python.keras.layers import Conv1D
from tensorflow.python.keras.layers import MaxPooling1D
from tensorflow.python.keras.layers import GlobalAveragePooling1D

import tensorflow.keras
from tensorflow.keras import optimizers

from tensorflow.keras.models import Sequential
from tensorflow.keras.applications.resnet50 import ResNet50
from tensorflow.keras.applications.resnet50 import preprocess_input as preprocess_resnet50
from tensorflow.keras.applications.resnet50 import  decode_predictions
from tensorflow.keras.applications.vgg16 import VGG16
from tensorflow.keras.applications.vgg16 import preprocess_input as preprocess_vgg16

from tensorflow.keras.layers import Reshape, Input
from tensorflow.keras.layers import Dense
from tensorflow.keras.layers import Dropout
from tensorflow.keras.layers import Activation
from tensorflow.keras.layers import Flatten
from tensorflow.keras.layers import Conv2D, MaxPooling2D
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.regularizers import l2
from tensorflow.keras.layers import average 

import tensorflow as tf
import pandas as pd
import numpy as np
import re
import os

from google.cloud import storage

tf.logging.set_verbosity(tf.logging.INFO)

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
CLASSES = { CLASSES_LIST[i]: i for i in range(len(CLASSES_LIST))}

# For image classification
HEIGHT = 224
WIDTH = 224
NUM_CHANNELS = 3
NCLASSES = 50

# For text classification
TOP_K = 20000  # Limit on the number vocabulary size used for tokenization
MAX_SEQUENCE_LENGTH = 500  # Sentences will be truncated/padded to this length
PADWORD = 'ZYXW'



# For image classification
def read_and_preprocess_with_augment(image_bytes, bucket_name=None, product_name=None, description=None, bucket_label=None, pretrained='none'):
    return read_and_preprocess(image_bytes=image_bytes, bucket_name=bucket_name, product_name=product_name, description=description, bucket_label=bucket_label, augment=True, pretrained=pretrained)


# For image classification
def read_and_preprocess(image_bytes, bucket_name=None, product_name=None, description=None, bucket_label=None, augment=False, pretrained='none'):
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
    if pretrained == 'none':
        image = tf.image.convert_image_dtype(image = image, dtype = tf.float32) # 0-1
        image = tf.subtract(x = image, y = 0.5)
        image = tf.multiply(x = image, y = 2.0)
    elif pretrained == 'res_50':
        image = preprocess_resnet50(image)
    elif pretrained == 'vgg16':
        image = preprocess_vgg16(image)    
    else:
        raise Exception('unknown pretrained model {}'.format(pretrained))

    return image, tf.one_hot(bucket_label, 50)
    return {'imagem':image}, bucket_name


# For image classification
def load_data(train_data_path, eval_data_path):
    column_names = ('bucket_name', 'product_id', 'product_name', 'description')

    def download_from_gcs(source, destination):
        search = re.search('gs://(.*?)/(.*)', source)
        bucket_name = search.group(1)
        blob_name = search.group(2)
        storage_client = storage.Client()
        bucket = storage_client.get_bucket(bucket_name)
        bucket.blob(blob_name).download_to_filename(destination)

    if train_data_path.startswith('gs://'):
        download_from_gcs(train_data_path, destination='train.csv')
        train_data_path = 'train.csv'
    if eval_data_path.startswith('gs://'):
        download_from_gcs(eval_data_path, destination='eval.csv')
        eval_data_path = 'eval.csv'

    def download_image(product_id, bucket_name, product_name, description, bucket_label):
        image_bytes = tf.read_file(filename = product_id)
        return image_bytes, bucket_name, product_name, description, bucket_label
    
    # Parse CSV using pandas
    df_train = pd.read_csv(train_data_path)
    df_eval = pd.read_csv(eval_data_path)
    
    df_train['bucket_label'] = df_train['bucket_name'].map(CLASSES)
    df_eval['bucket_label'] = df_eval['bucket_name'].map(CLASSES)
    
    tf_train = tf.data.Dataset.from_tensor_slices(
        (
            tf.cast(df_train['product_id'].values, tf.string),
            tf.cast(df_train['bucket_name'].values, tf.string),
            tf.cast(df_train['product_name'].values, tf.string),
            tf.cast(df_train['description'].values, tf.string),
            tf.cast(df_train['bucket_label'].values, tf.int32)
        )
    ).map(download_image)
    
    tf_eval = tf.data.Dataset.from_tensor_slices(
        (
            tf.cast(df_train['product_id'].values, tf.string),
            tf.cast(df_train['bucket_name'].values, tf.string),
            tf.cast(df_train['product_name'].values, tf.string),
            tf.cast(df_train['description'].values, tf.string),
            tf.cast(df_train['bucket_label'].values, tf.int32)
        )
    ).map(download_image)

    return (
        (
            list(df_train['product_name']),
            list(df_train['description']),
            list(df_train['product_id']),
            np.array(df_train['bucket_name'].map(CLASSES)),
            tf_train
        ),
        (
            list(df_eval['product_name']),
            list(df_eval['description']),
            list(df_eval['product_id']),
            np.array(df_eval['bucket_name'].map(CLASSES)),
            tf_eval
        )
    )


# This will read the dataset for both image and text classification
def make_image_input_fn(dataset, batch_size, mode, augment = False, pretrained = False):
    if augment: 
        dataset = dataset.map(map_func = read_and_preprocess_with_augment)
    else:
        dataset = dataset.map(map_func = read_and_preprocess)

    if mode == tf.estimator.ModeKeys.TRAIN:
        num_epochs = None
        print('num epochs:', num_epochs)
        # indefinitely
        dataset = dataset.shuffle(buffer_size = 5 * batch_size)
    else:
        num_epochs = None # end-of-input after this

    dataset = dataset.repeat(count = num_epochs).batch(batch_size = batch_size)
    return dataset


"""
For text classificatoin
Create tf.estimator compatible input function
  # Arguments:
      texts: [strings], list of sentences
      labels: numpy int vector, integer labels for sentences
      batch_size: int, number of records to use for each train batch
      mode: tf.estimator.ModeKeys.TRAIN or tf.estimator.ModeKeys.EVAL 
  # Returns:
      tf.data.Dataset, produces feature and label
        tensors one batch at a time
"""
def input_fn(texts, labels, batch_size, mode):
    # Convert texts from python strings to tensors
    x = tf.constant(texts)

    # Map text to sequence of word-integers and pad
    x = vectorize_sentences(x)

    # Create tf.data.Dataset from tensors
    dataset = tf.data.Dataset.from_tensor_slices((x, labels))

    # Pad to constant length
    dataset = dataset.map(pad)

    if mode == tf.estimator.ModeKeys.TRAIN:
        num_epochs = None #loop indefinitley
        dataset = dataset.shuffle(buffer_size=50000) # our input is already shuffled so this is redundant
    else:
        num_epochs = 1

    dataset = dataset.repeat(num_epochs).batch(batch_size)
    return dataset


"""
For text classification
Given an int tensor, remove 0s then pad to a fixed length representation. 
  #Arguments:
    feature: int tensor 
    label: int. not used in function, just passed through
  #Returns:
    (int tensor, int) tuple.
"""
def pad(feature, label):
    # 1. Remove 0s which represent out of vocabulary words
    nonzero_indices = tf.where(tf.not_equal(feature, tf.zeros_like(feature)))
    without_zeros = tf.gather(feature,nonzero_indices)
    without_zeros = tf.squeeze(without_zeros, axis=1)

    # 2. Prepend 0s till MAX_SEQUENCE_LENGTH
    padded = tf.pad(without_zeros, [[MAX_SEQUENCE_LENGTH, 0]])  # pad out with zeros
    padded = padded[-MAX_SEQUENCE_LENGTH:]  # slice to constant length
    return (padded, label)


"""
For text classification
Given sentences, return an integer representation
  # Arguments:
      sentences: string tensor of shape (?,), contains sentences to vectorize
  # Returns:
      Integer representation of the sentence. Word-integer mapping is determined
        by VOCAB_FILE_PATH. Words out of vocabulary will map to 0
"""
def vectorize_sentences(sentences):
    # 1. Remove punctuation
    sentences = tf.regex_replace(sentences, '[[:punct:]]', ' ')

    # 2. Split string tensor into component words
    words = tf.string_split(sentences)
    words = tf.sparse_tensor_to_dense(words, default_value=PADWORD)

    # 3. Map each word to respective integer
    table = tf.contrib.lookup.index_table_from_file(
        vocabulary_file=VOCAB_FILE_PATH,
        num_oov_buckets=0,
        vocab_size=None,
        default_value=0,  # for words not in vocabulary (OOV)
        key_column_index=0,
        value_column_index=1,
        delimiter=',')
    numbers = table.lookup(words)

    return numbers


"""
For text classification
Builds a CNN model using keras and converts to tf.estimator.Estimator
  # Arguments
      model_dir: string, file path where training files will be written
      config: tf.estimator.RunConfig, specifies properties of tf Estimator
      filters: int, output dimension of the layers.
      kernel_size: int, length of the convolution window.
      embedding_dim: int, dimension of the embedding vectors.
      dropout_rate: float, percentage of input to drop at Dropout layers.
      pool_size: int, factor by which to downscale input at MaxPooling layer.
      embedding_path: string , file location of pre-trained embedding (if used)
        defaults to None which will cause the model to train embedding from scratch
      word_index: dictionary, mapping of vocabulary to integers. used only if
        pre-trained embedding is provided

    # Returns
        A tf.estimator.Estimator 
"""
def keras_estimator(model_dir,
                    config,
                    learning_rate,
                    filters=64,
                    dropout_rate=0.2,
                    embedding_dim=200,
                    kernel_size=3,
                    pool_size=3,
                    embedding_path=None,
                    word_index=None):
    # Create model instance.
#     model = models.Sequential()
    num_features = min(len(word_index) + 1, TOP_K)

    # Add embedding layer. If pre-trained embedding is used add weights to the
    # embeddings layer and set trainable to input is_embedding_trainable flag.
    input_tensor = Input(shape=(None,),
                        dtype='int32', 
                        name='input_text')
    if embedding_path != None:
        embedding_matrix = get_embedding_matrix(word_index, embedding_path, embedding_dim)
        is_embedding_trainable = True  # set to False to freeze embedding weights

        text_input = Embedding(input_dim=num_features,
                            output_dim=embedding_dim,
                            input_length=MAX_SEQUENCE_LENGTH,
                            weights=[embedding_matrix],
                            trainable=is_embedding_trainable)(input_tensor)
    else:
        text_input = Embedding(input_dim=num_features,
                            output_dim=embedding_dim,
                            input_length=MAX_SEQUENCE_LENGTH)(input_tensor)

#     text_input = Flatten()(text_input)
    x = Dropout(rate=dropout_rate)(text_input)
    x = Conv1D(filters=filters,
                              kernel_size=kernel_size,
                              activation='relu',
                              bias_initializer='random_uniform',
                              padding='same')(x)

    x = MaxPooling1D(pool_size=pool_size)(x)
    x = Conv1D(filters=filters * 2,
                              kernel_size=kernel_size,
                              activation='relu',
                              bias_initializer='random_uniform',
                              padding='same')(x)
    x = GlobalAveragePooling1D()(x)
    x = Dropout(rate=dropout_rate)(x)
    predictions = Dense(len(CLASSES), activation='softmax')(x)
    
    #specify the model
    model_text = tf.keras.Model(inputs=input_tensor, outputs = predictions)

    # Compile model with learning parameters.
    optimizer = tf.keras.optimizers.Adam(lr=learning_rate)
    model_text.compile(optimizer=optimizer, loss='sparse_categorical_crossentropy', metrics=['acc'])
    model_text.compile(optimizer=optimizer, loss='sparse_categorical_crossentropy', metrics=['acc'])
    estimator = tf.keras.estimator.model_to_estimator(keras_model=model_text, model_dir=model_dir, config=config)

    
    return estimator


"""
For text classification
Defines the features to be passed to the model during inference
  Can pass in string text directly. Tokenization done in serving_input_fn 
  # Arguments: none
  # Returns: tf.estimator.export.ServingInputReceiver
"""
def serving_input_fn():
    feature_placeholder = tf.placeholder(tf.string, [None])
    features = vectorize_sentences(feature_placeholder)
    return tf.estimator.export.TensorServingInputReceiver(features, feature_placeholder)


"""
For text classification
Takes embedding for generic vocabulary and extracts the embeddings
  matching the current vocabulary
  The pre-trained embedding file is obtained from https://nlp.stanford.edu/projects/glove/
  # Arguments: 
      word_index: dict, {key =word in vocabulary: value= integer mapped to that word}
      embedding_path: string, location of the pre-trained embedding file on disk
      embedding_dim: int, dimension of the embedding space
  # Returns: numpy matrix of shape (vocabulary, embedding_dim) that contains the embedded
      representation of each word in the vocabulary.
"""
def get_embedding_matrix(word_index, embedding_path, embedding_dim):
    # Read the pre-trained embedding file and get word to word vector mappings.
    embedding_matrix_all = {}

    # Download if embedding file is in GCS
    if embedding_path.startswith('gs://'):
        download_from_gcs(embedding_path, destination='embedding.csv')
        embedding_path = 'embedding.csv'

    with open(embedding_path) as f:
        for line in f:  # Every line contains word followed by the vector value
            values = line.split()
            word = values[0]
            coefs = np.asarray(values[1:], dtype='float32')
            embedding_matrix_all[word] = coefs

    # Prepare embedding matrix with just the words in our word_index dictionary
    num_words = min(len(word_index) + 1, TOP_K)
    embedding_matrix = np.zeros((num_words, embedding_dim))

    for word, i in word_index.items():
        if i >= TOP_K:
            continue
        embedding_vector = embedding_matrix_all.get(word)
        if embedding_vector is not None:
            # words not found in embedding index will be all-zeros.
            embedding_matrix[i] = embedding_vector
    return embedding_matrix


"""
Main orchestrator for text classification
"""
def _train_text(output_dir, hparams, field):
    # Load Data
    (
        (train_product_name, train_description, _, train_labels, _),
        (test_product_name, test_description, _, test_labels, _)
    ) = load_data(hparams['train_data_path'], hparams['eval_data_path'])
    
    if field == 'product_name':
        train_texts = train_product_name
        test_texts = test_product_name
    else:
        train_texts = train_description
        test_texts = test_description

    # Create vocabulary from training corpus.
    tokenizer = text.Tokenizer(num_words=TOP_K)
    tokenizer.fit_on_texts(train_texts)

    # Generate vocabulary file from tokenizer object to enable
    # creating a native tensorflow lookup table later (used in vectorize_sentences())
    tf.gfile.MkDir(output_dir) # directory must exist before we can use tf.gfile.open
    global VOCAB_FILE_PATH; VOCAB_FILE_PATH = os.path.join(output_dir,'vocab.txt')
    with tf.gfile.Open(VOCAB_FILE_PATH, 'wb') as f:
        f.write("{},0\n".format(PADWORD))  # map padword to 0
        for word, index in tokenizer.word_index.items():
            if index < TOP_K: # only save mappings for TOP_K words
                f.write("{},{}\n".format(word, index))

    # Create estimator
    run_config = tf.estimator.RunConfig(save_checkpoints_steps=500)
    estimator = keras_estimator(
        model_dir=output_dir,
        config=run_config,
        learning_rate=hparams['learning_rate'],
        embedding_path=hparams['embedding_path'],
        word_index=tokenizer.word_index
    )

    # Create TrainSpec
    train_steps = hparams['num_epochs'] * len(train_texts) / hparams['batch_size']
    train_spec = tf.estimator.TrainSpec(
        input_fn=lambda:input_fn(
            train_texts,
            train_labels,
            hparams['batch_size'],
            mode=tf.estimator.ModeKeys.TRAIN),
        max_steps=train_steps
    )

    # Create EvalSpec
    exporter = tf.estimator.LatestExporter('exporter', serving_input_fn)
    eval_spec = tf.estimator.EvalSpec(
        input_fn=lambda:input_fn(
            test_texts,
            test_labels,
            hparams['batch_size'],
            mode=tf.estimator.ModeKeys.EVAL),
        steps=None,
        exporters=exporter,
        start_delay_secs=10,
        throttle_secs=10
    )

    # Start training
    tf.estimator.train_and_evaluate(estimator, train_spec, eval_spec)


"""
Main orchestrator for product_name
"""
def train_product_name(output_dir, hparams):
    return _train_text(output_dir, hparams, 'product_name')


"""
Main orchestrator for product_name
"""
def train_description(output_dir, hparams):
    return _train_text(output_dir, hparams, 'description')



"""
Main orchestrator for image classification
"""
def train_image(output_dir, hparams, model = 'res_50'):
    (
            (train_product_name, train_description, train_imgurl, train_labels, train_tfset),
            (test_product_name, test_description, test_imgurl, test_labels, eval_tfset)
     ) = load_data(hparams['train_data_path'], hparams['eval_data_path'])


      
    train_input_fn = make_image_input_fn(train_tfset, 100, tf.estimator.ModeKeys.TRAIN, pretrained=hparams['pretrained'])
    eval_input_fn = make_image_input_fn(eval_tfset, 100, tf.estimator.ModeKeys.EVAL, pretrained=hparams['pretrained'])

    if model=='res_50':
  # connect new layers to the output
        res_model = ResNet50(weights='imagenet', include_top=False,  input_shape=(224, 224, 3))
        layer_dict = dict([(layer.name, layer) for layer in res_model.layers])
        x = layer_dict['activation_48'].output
        x = Flatten()(x)
        # let's add a fully-connected layer
        x = Dense(100, activation='relu',kernel_initializer='he_uniform')(x)
        # and a fully connected layer 
        predictions = Dense(50, activation='softmax', kernel_initializer='glorot_uniform')(x)

        Res50 = tf.keras.Model(inputs=res_model.input, outputs=predictions)

        # freeze ResNet during training
        for layer in res_model.layers:
            layer.trainable = False

        Res50.compile(optimizer='adam',
                      loss='categorical_crossentropy',
                      metrics=['accuracy'])

        Res50.fit(train_input_fn,
                  validation_data=eval_input_fn,
                  epochs=10,
                  validation_steps=209,
                  steps_per_epoch=712)
        export_path = tf.contrib.saved_model.save_keras_model(Res50, output_dir)
        print("Model exported to: ", export_path)
        return
    elif model == 'vgg16':

        #Load the VGG model
        vgg_16 = VGG16(weights='imagenet', include_top=False,  input_shape=(224, 224, 3))
        # Freeze the layers except the last 4 layers
        for layer in vgg_16.layers[:-4]:
            layer.trainable = False

        # Getting output tensor of the last VGG layer that we want to include
        layer_dict = dict([(layer.name, layer) for layer in vgg_16.layers])
        x = layer_dict['block2_pool'].output
        
#         flat = Flatten()(x)
#         x = Dropout(0.20)(flat)
        
        x = Conv2D(filters=64, kernel_size=(3, 3), activation='relu')(x)
        x = MaxPooling2D(pool_size=(2, 2))(x)
        x = Flatten()(x)        
        
        x = Dense(1024, activation='relu',kernel_initializer='he_uniform')(x)
        x = Dropout(0.4)(x)
        predictions = Dense(50, activation='softmax', kernel_initializer='glorot_uniform')(x)
        vgg16 = tf.keras.Model(inputs=vgg_16.input, outputs = predictions)
        vgg16.compile(
              optimizer=optimizers.RMSprop(lr=1e-5),
              loss = 'categorical_crossentropy',
              metrics=['accuracy'])
        vgg16.fit(train_input_fn,
                  validation_data=eval_input_fn,
                  epochs=20,
                  validation_steps=209,#8348/40 len(df)/batch_size
                  steps_per_epoch=712 ) #28477/40 len(df)/batch_size)     
    else:
        raise Exception("incorrect model name")

    
   
