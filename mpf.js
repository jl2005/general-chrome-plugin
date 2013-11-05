$.mongohq.authenticate({ apikey: 'JS871kzvQxDPgvhal0nVCi6pojOexzyFCzL5T29c8'});
var page_titles = [
    "強積金／職業退休計劃 - 香港滙豐",
    "强积金／职业退休计划 - 香港汇丰",
    "MPF / ORSO - HSBC in Hong Kong",
];
var history_page_titles = [
    '強積金過往供款紀錄 - 香港滙豐',
    '强积金过往供款纪录 - 香港汇丰',
    'MPF Contribution History - HSBC in Hong Kong'
]
var languages = [
    'zh-TW',
    '',
    'en',
];

var lastest = null;
var records = null;

function desktop_notify(msg){
    if (window.location.host == "www.ebanking.hsbc.com.hk"
        || window.location.host == "www1.ebanking.hsbc.com.hk") {
        document.body.addEventListener('click', function() {
            window.webkitNotifications.requestPermission();
        });
        if ( window.webkitNotifications.checkPermission() == 0) {
            // 0 is PERMISSION_ALLOWED
            window.webkitNotifications.createNotification(
                'logo.gif', '汇丰强基金', msg).show();
        }
    }
    
}

function dropbox_upload(file, msg){
    var appKey = {
        key: 'mhdekr8ni11mgya',
        secret: '99g8t5rrlbnv8vs',
        sandbox: false,
        token: 'vcezb2vjs9f9azy',
        tokenSecret: 'z4ll8q2tvl58ezo',
        uid: 65338611,
    };
    var client = new Dropbox.Client(appKey);
    //client.authDriver(new Dropbox.Drivers.Redirect());
    //client.authenticate(function(error, data) {
    //    if (error) { return showError(error); }
    //    //doSomethingUseful(client);  // The user is now authenticated.
    //});
    msg = JSON.stringify(msg);
    var filename = "/public/HSBC-MPF/" + file +".txt";
    client.writeFile(filename, msg,
        function(error, stat) {
           if (error) 
             return showError(error);
        }
    );
}

function get_records(){
    var ret = $.mongohq.documents.all({
        db_name: 'cuhk',
        col_name: 'mpf',
        query: {
            sort: JSON.stringify({ts: -1}),
            fields: JSON.stringify(['total_fund', 'ts', 'funds']),
            limit: 1,
        },
        success: function(result){
            lastest = result[result.length-1];
            records = result;
        }
    });
}

function save_record_to_mongohq(record){
    function real_save(record){
        $.mongohq.documents.create({
            db_name: 'cuhk',
            col_name: 'mpf',
            params: JSON.stringify(record)
        });
    }
    //try{
    //    JSON.stringify(lastest.funds);
    //} catch (error) {
    //    real_save(record);
    //}
    //if(JSON.stringify(record.document.funds)!=
    //   JSON.stringify(lastest.funds)){
    //    real_save(record);
    //}
    lastfund = Math.round(lastest.total_fund*100)/100;
    if(record.document.total_fund != lastfund){
        real_save(record);
        D_value = record.document.total_fund - lastfund;
        D_value = Math.round(D_value*100)/100;
        if(D_value>0){
            var file = 'Increased by '+ D_value + ', Now total: '+ record.document.total_fund;
            desc = '恭喜，您的强基金账户收入了' + D_value +'元';
        }else{
            var file = 'Decreased by '+ (0-D_value) + ', Now total: '+ record.document.total_fund;;
            desc = '请注意，您的强基金账户损失了' + (0-D_value) +'元';
        }
        desktop_notify(desc);
        dropbox_upload(file, record['document']);
        html = "<div style='visibility:hidden;display:hidden;'>";
        html += "<iframe id='tts-iframe' style='display:none' width='1px' ";
        html += "height='1px' src='http://translate.google.cn/translate_tts?q=";
        html += desc;
        html += "&tl=zh-CN' ></iframe>";
        injectEle("span", "", html, 'body');
    }
}

function parse_and_save_record(){
    var record = {};
    var table = document.getElementsByClassName('hsbcTableStyle04')[2];
    var trs = table.getElementsByTagName('tr');
    var money = Array();
    var total = 0.0;
    for(var i=0;i<trs.length-1;i++){
        var fund = {};
        var tds = trs[i].getElementsByTagName('td');
        fund['name'] = tds[0].innerText;
        fund['code'] = tds[1].innerText;
        fund['count'] = parseFloat(tds[2].innerText.replace(/,/g, ''));
        total += fund['count'];
        fund['percent'] = parseFloat(tds[3].innerText);
        money.push(fund);
    }
    var d = new Date();
    record['funds'] = money;
    total = Math.round(total*100)/100;
    record['total_fund'] = total;
    record['year'] = d.getFullYear();
    record['month'] = d.getMonth()+1;
    record['date'] = d.getDate();
    record['hour'] = d.getHours();
    record['minute'] = d.getMinutes();
    record['second'] = d.getSeconds();
    record['ts'] = Date.now();
    var newone = {
        document: record
    };
    save_record_to_mongohq(newone);
}

function classify_page(){
    if(page_titles.indexOf(document.title)!=-1){
        //inject_chart_btn();
        parse_and_save_record();
        //close_window();
        setTimeout(close_window, 2000);
    }
    if(history_page_titles.indexOf(document.title)!=-1){
    }
    if(document.title=="個人網上理財 - 香港匯豐"){
        unsafeInvoke(change_lang_to_ch);
    }
    if(document.title=="个人网上理财 - 香港汇丰"){
        unsafeInvoke(login_step1);
    }
    if(document.title=="输入密码及第二密码 - 香港汇丰"){
        unsafeInvoke(login_step2);
    }
    if(document.title=="我的HSBC - 香港汇丰"){
        unsafeInvoke(goto_mpf_page);
    }
}


function change_lang_to_ch(){
    PC_7_0G3UNU10SD0MHTI7TQA0000000000000_toggleLang('zh', '');
}
function login_step1(){
    document.getElementsByName('u_UserID')[0].value='username';
    document.getElementById('submittype').value = 'click';
    PC_7_0G3UNU10SD0MHTI7TQA0000000000000_selectLogonMode(0)
    PC_7_0G3UNU10SD0MHTI7TQA0000000000000_validate();
}
function login_step2(){
    document.getElementsByName('memorableAnswer')[0].value='password';
    var key_maps = {
        '第一': 'p',
        '第二': 'a',
        '第三': 's',
        '第四': 's',
        '第五': 'w',
        '第六': 'o',
        '倒数第二': 'r',
        '最后': 'd',
    };
    var labels = document.getElementsByTagName('label');
    var psws = Array();
    psws.push(key_maps[labels[2].innerText.replace(/\n|\r/g,"")]);
    psws.push(key_maps[labels[3].innerText.replace(/\n|\r/g,"")]);
    psws.push(key_maps[labels[4].innerText.replace(/\n|\r/g,"")]);
    setTimeout('focusNext(document.PC_7_0G3UNU10SD0MHTI7EMA0000000000000_2ndpwd.RCC_PWD1, document.PC_7_0G3UNU10SD0MHTI7EMA0000000000000_2ndpwd.RCC_PWD2, 1)', 100);
    document.getElementsByName('RCC_PWD1')[0].value = psws[0];
    setTimeout('focusNext(document.PC_7_0G3UNU10SD0MHTI7EMA0000000000000_2ndpwd.RCC_PWD2, document.PC_7_0G3UNU10SD0MHTI7EMA0000000000000_2ndpwd.RCC_PWD3, 1)', 100);
    document.getElementsByName('RCC_PWD2')[0].value = psws[1];
    document.getElementsByName('RCC_PWD3')[0].value = psws[2];
    PC_7_0G3UNU10SD0MHTI7EMA0000000000000_myvalidate(submitURL);
}
function goto_mpf_page(){
    PC_7_0G3UNU10SD0GHOSDV590000000000000_checkDropOff('/1/3/mpf?__cmd-All_MenuRefresh=');
}


get_records();

//CLASSIFY PAGE
setTimeout(classify_page, 2000);
