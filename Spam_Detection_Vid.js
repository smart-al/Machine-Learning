import * as tf from  '@tensorflow/tfjs'

const POST_COMMENT_BTN = document.getElementById('post');
const COMMENT_TEXT = document.getElementById('comment');
const COMMENTS_LIST = document.getElementById('commentsList');
// CSS styling class to indicate comment is being processed when
// posting to provide visual feedback to users.
const PROCESSING_CLASS = 'processing';

/** 
 * Function to handle the processing of submitted comments.
 **/
function handleCommentPost() {
  // Only continue if you are not already processing the comment.
  if (! POST_COMMENT_BTN.classList.contains(PROCESSING_CLASS)) {
    POST_COMMENT_BTN.classList.add(PROCESSING_CLASS);
    COMMENT_TEXT.classList.add(PROCESSING_CLASS);
    let currentComment = COMMENT_TEXT.innerText;
    console.log(currentComment);
    
    let lowercaseSentenceArray = currentComment.toLowerCase().replace(/[^\w\s]/g, '').split(' ');

    let li = document.createElement('li');
    let p = document.createElement('p');
    p.innerText = COMMENT_TEXT.innerText;
    let spanName = document.createElement('span');
    spanName.setAttribute('class', 'username');
    spanName.innerText = currentUserName;
    let spanDate = document.createElement('span');
    spanDate.setAttribute('class', 'timestamp');
    let curDate = new Date();
    spanDate.innerText = curDate.toLocaleString();
    li.appendChild(spanName);
    li.appendChild(spanDate);
    li.appendChild(p);
    COMMENTS_LIST.prepend(li);
    COMMENT_TEXT.innerText = '';

    loadAndPredict(tokenize(lowercaseSentenceArray), li).then(function() {
      POST_COMMENT_BTN.classList.remove(PROCESSING_CLASS);
      COMMENT_TEXT.classList.remove(PROCESSING_CLASS);
    });
  }
}

POST_COMMENT_BTN.addEventListener('click', handleCommentPost);

const MODEL_JSON_URL = 'https://storage.googleapis.com/jmstore/TensorFlowJS/EdX/SavedModels/spam/model.json';
const SPAM_THRESHOLD = 0.75;
var model = undefined;


async function loadAndPredict(inputTensor, domComment) {
  if (model === undefined) {
    model = await tf.loadLayersModel(MODEL_JSON_URL);
  }

  let results = model.predict(inputTensor);
  results.print();
  
  let dataArray = results.dataSync();
  if (dataArray[1] > SPAM_THRESHOLD) {
    domComment.classList.add('spam');
  } else {
    // Emit socket.io comment event for server to handle containing
    // all the comment data you would need to render the comment on
    // a remote client's front end.
    socket.emit('comment', {
      username: currentUserName,
      timestamp: domComment?.querySelectorAll('span')[1].innerText,
      comment: domComment?.querySelectorAll('p')[0].innerText
    });
  }
}

loadAndPredict(tf.tensor([[1,3,12,18,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]));


import * as DICTIONARY from 'https://storage.googleapis.com/jmstore/TensorFlowJS/EdX/SavedModels/spam/dictionary.js';

const ENCODING_LENGTH = 20;


function tokenize(wordArray) {
  let returnArray = [DICTIONARY.START];
  
  for (var i = 0; i < wordArray.length; i++) {
    let encoding = DICTIONARY.LOOKUP[wordArray[i]];
    returnArray.push(encoding === undefined ? DICTIONARY.UNKNOWN : encoding);
  }

  while (returnArray.length < ENCODING_LENGTH) {
    returnArray.push(DICTIONARY.PAD);
  }
  
  console.log(returnArray);

  return tf.tensor2d([returnArray]);
}
  
  let socket = io.connect();

function handleRemoteComments(data) {
  let li = document.createElement('li');
  let p = document.createElement('p');
  p.innerText = data.comment;

  let spanName = document.createElement('span');
  spanName.setAttribute('class', 'username');
  spanName.innerText = data.username;

  let spanDate = document.createElement('span');
  spanDate.setAttribute('class', 'timestamp');
  spanDate.innerText = data.timestamp;

  li.appendChild(spanName);
  li.appendChild(spanDate);
  li.appendChild(p);
  
  COMMENTS_LIST.prepend(li);
}

socket.on('remoteComment', handleRemoteComments);
