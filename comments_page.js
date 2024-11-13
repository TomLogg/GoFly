// Load comments from local storage
const commentsArray = JSON.parse(localStorage.getItem("comments")) || [];

document.addEventListener("DOMContentLoaded", () => {
  const allCommentsList = document.getElementById("all-comments-list");
  const dateFilterInput = document.getElementById("date-filter");

  function displayComments(comments) {
    allCommentsList.innerHTML = comments.length
      ? comments
          .map(
            (comment) => `
                <li>
                    <strong>${comment.certification}:</strong> ${comment.text}
                    <br><em>Submitted on ${comment.timestamp}</em>
                </li>
            `
          )
          .join("")
      : "<li>No comments available for this date</li>";
  }

  function filterCommentsByDate() {
    const selectedDate = dateFilterInput.value;
    if (!selectedDate) {
      displayComments(commentsArray); // Show all comments if no date is selected
      return;
    }

    const filteredComments = commentsArray.filter((comment) => {
      const commentDate = new Date(comment.timestamp)
        .toISOString()
        .split("T")[0];
      return commentDate === selectedDate;
    });

    displayComments(filteredComments);
  }

  // Display all comments on page load
  displayComments(commentsArray);

  // Event listeners for filter and clear buttons
  document
    .getElementById("filter-button")
    .addEventListener("click", filterCommentsByDate);
  document.getElementById("clear-filter").addEventListener("click", () => {
    dateFilterInput.value = "";
    displayComments(commentsArray);
  });
});
