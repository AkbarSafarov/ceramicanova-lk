document.addEventListener("DOMContentLoaded", function() {
    const myCabinet = document.querySelector('.my_cabinet');
    const openedItem = document.querySelector('.login_menu li.opened'); 

    if (myCabinet && openedItem) {
        myCabinet.innerHTML = openedItem.innerHTML;
    }

    myCabinet?.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.login_menu').classList.toggle('show');
    });
});
