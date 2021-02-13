function showWorkDetail() {
    var workDetail = document.querySelector("#workDetail");
    var icon = document.querySelector("#chevronIcon");
    if (workDetail.style.display === "block") {
        workDetail.style.display = "none";
    }
    else {
        workDetail.style.display = "block";
    }
    if(icon.classList.contains("fa-chevron-down")){
        icon.classList.remove("fa-chevron-down");
        icon.classList.add("fa-chevron-up");
    }
    else {
        icon.classList.remove("fa-chevron-up");
        icon.classList.add("fa-chevron-down");
    }
  }