
function getCommentBoardFromCookie() {
    const FullCommentBoard = JSON.parse(localStorage.getItem("CommentBoard"));
    console.log(FullCommentBoard[1]);
}

function getCommentBoardFromServer() {}

function refreshCommentBoard() {}

function postCommentToServer() {}

function postCommentToCookie() {
    console.log("Comment Posted!");
}

function postComment(cookie) {
    if (cookie) {
        postCommentToCookie();
    } else {
        postCommentToServer();
    }
}






//const commentBoard = getCommentBoardFromCookie();