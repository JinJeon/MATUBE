const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const deleteBtn = document.querySelectorAll("#deleteBtn");

const addComment = (text, id) => {
  const videoComment = document.querySelector(".video__comment ul");
  const newComment = document.createElement("li");
  newComment.className = "comment__text";
  newComment.dataset.id = id;
  const icon1 = document.createElement("i");
  icon1.className = "fas fa-comment";
  const span1 = document.createElement("span");
  span1.innerText = ` ${text}`;
  const button1 = document.createElement("button");
  button1.className = "fas fa-dove";
  button1.id = "deleteBtn";
  button1.addEventListener("click", handleDeleteBtn);

  newComment.appendChild(icon1);
  newComment.appendChild(span1);
  newComment.appendChild(button1);
  videoComment.prepend(newComment);
};

const handleAdd = async (event) => {
  event.preventDefault();
  const area = form.querySelector("textarea");
  const text = area.value;
  const { id } = videoContainer.dataset;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/video/${id}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  area.value = "";
  const { newCommentId } = await response.json();
  if (response.status === 201) {
    addComment(text, newCommentId);
  }
};

const handleDeleteBtn = async (event) => {
  console.log("done");
  const { id } = event.target.parentNode.dataset;
  const li = document.querySelector(`[data-id="${id}"]`);
  const response = await fetch(`/api/video/${id}/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });
  if (response.status === 201) {
    li.remove();
  }
};

if (form) {
  form.addEventListener("submit", handleAdd);
}
deleteBtn.forEach((deleteBtn) =>
  deleteBtn.addEventListener("click", handleDeleteBtn)
);
