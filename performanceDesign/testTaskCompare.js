const cacheService = require("./cacheService");
const mongoose = require("mongoose");
const fs = require('fs');
const checkPointFile = "checkPoint"

//初始化断点
function initCheckPoint(orgs) { 
	if (fs.existsSync(checkPointFile)) {
		data = fs.readFileSync(checkPointFile, 'utf8');
		old_orgs = JSON.parse(data)
    	if(old_orgs.length > 0) return
	}
    data = JSON.stringify(orgs)
    fs.writeFileSync(checkPointFile,data);
} 

//读断点
function readCheckPoint() { 
    var data = fs.readFileSync(checkPointFile, 'utf8');
    orgs = JSON.parse(data)
	return orgs[0]
} 
 
//更新断点
function updateCheckPoint(){ 
    var data = fs.readFileSync(checkPointFile, 'utf8');
    orgs = JSON.parse(data)
    orgs.shift()
    new_data = JSON.stringify(orgs)
    fs.writeFileSync(checkPointFile,new_data);
} 

function compareTwoObj(a,b){ 
    return true;
} 

async function scanner() {
    task_codes =await cacheService.getSxzxDB().model('remotetasks').find(
        {},
        {task_code:1}
    );
    cp = [];
    for (i = 0; i < task_codes.length; i++){
        cp.push(task_codes[i].task_code);
    }
    initCheckPoint(cp);
}

async function comparer() {
    while (true) {
        const code = readCheckPoint();
        if (code == null) break;
        
        remoteT =await cacheService.getSxzxDB().model('remotetasks').findOne(
            {task_code:code}
        );
        localT =await cacheService.getSxzxDB().model('tasks').findOne(
            {task_code:code}
        );
        if (remoteT == null) {
            console.log("not in remote");
        }
        if (localT == null) {
            console.log("not in local");
        }

        res = compareTwoObj(remoteT, localT);
        if(res==false) console.log("不一致:"+remoteT.task_code);

        updateCheckPoint()
    }
}


async function test(){
    await cacheService.init();
    scanner();
    comparer();
}

test();