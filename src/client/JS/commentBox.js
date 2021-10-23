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
  const span2 = document.createElement("span");
  span2.id = "deleteBtn";
  const icon2 = document.createElement("i");
  icon2.className = "fas fa-dove";
  span2.appendChild(icon2);

  newComment.appendChild(icon1);
  newComment.appendChild(span1);
  newComment.appendChild(span2);
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
  const { id } = event.target.parentNode.parentNode.dataset;
  const li = document.querySelector(`[data-id="${id}"]`);
  const response = await fetch(`/api/video/${id}/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (response.status === 201) {
    li.remove();
  }
};

if (form) {
  form.addEventListener("submit", handleAdd);
  deleteBtn.forEach((deleteBtn) =>
    deleteBtn.addEventListener("click", handleDeleteBtn)
  );
}
