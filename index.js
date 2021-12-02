function showWorkDetail() {
    var workDetail = document.querySelector("#workDetail");
    var icon = document.querySelector("#chevronIcon");
    if (workDetail.style.display === "block") {
        workDetail.style.display = "none";
        icon.classList.remove("fa-chevron-up");
        icon.classList.add("fa-chevron-down");
    }
    else {
        workDetail.style.display = "block";
        icon.classList.remove("fa-chevron-down");
        icon.classList.add("fa-chevron-up");
    }
    // if(icon.classList.contains("fa-chevron-up")){
    //     icon.classList.remove("fa-chevron-up");
    //     icon.classList.add("fa-chevron-down");
    // }
    // else {
    //     icon.classList.remove("fa-chevron-down");
    //     icon.classList.add("fa-chevron-up");
    // }
  }