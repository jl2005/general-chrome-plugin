function test(){
    if(window.location.href=="http://www.baidu.com/"){
        unsafeInvoke(do_sth);
    }
}
function do_sth(){
    alert('Go To hk.jobsdb.com');
    window.location.href = 'http://hk.jobsdb.com/';
    //document.location.reload();
}

test();
