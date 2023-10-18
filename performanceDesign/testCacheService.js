const cacheService = require("./cacheService");
const mongoose = require("mongoose");

async function testCreate(rule_id, creator_id) {
    await cacheService.getSxzxDB().model('rules').create({
        rule_id: rule_id,
        rule_name: "test_" + rule_id,
        parentId: rule_id - 1,
        creator_id:creator_id
    });
    // await cacheService.getSxzxDB().model('rules').updateOne({
    //     filter: { rule_id: rule_id - 1 },
    //     update: { $push: { children: rule_id } },
    // });
}

async function testUpdate(rule_id, creator_id) {
    await cacheService.getSxzxDB().model('rules').updateOne(
        { rule_id: rule_id },
        { creator_id: creator_id }
    );
}

async function testDelete(rule_id) {
    await cacheService.getSxzxDB().model('rules').deleteOne({rule_id: rule_id});
}

async function testGetById(rule_id) {
    cli = cacheService.getRedisCli(6);
    let rule = await cli.get(rule_id);
    if (rule == null) {
        rule = await cacheService.getSxzxDB().model('rules').findOne({ rule_id: rule_id });
        console.log("get from db:",rule_id)
        if (rule != null) {
            cli.set(rule_id, JSON.stringify(rule));
            //绑定数据库与缓存数据
            cacheService.attachDbCache({
                db_id: rule._id.toString(),
                cache_key: rule_id,
                cache_id: 6,
            });
        }
    } else {
        console.log("get from cache:", rule_id)
        rule = JSON.parse(rule);
    }
    return rule;
}

async function testGetByName(rule_name) {
    cli = cacheService.getRedisCli(6);
    let rule = await cli.get(rule_name);
    if (rule == null) {
        rule = await cacheService.getSxzxDB().model('rules').findOne({ rule_name: rule_name });
        console.log("get from db:",rule_name)
        if (rule != null) {
            cli.set(rule_name, JSON.stringify(rule));
            //绑定数据库与缓存数据
            cacheService.attachDbCache({
                db_id: rule._id.toString(),
                cache_key: rule_name,
                cache_id: 6,
            });
        }
    } else {
        console.log("get from cache:",rule_name)
    }
    return rule;
}

function sleep(ms) {
    return new Promise(resolve=>setTimeout(resolve, ms))
}

async function getDelay(fun) {
    st = new Date().getTime();
    await fun();
    delay = new Date().getTime() - st;
    return delay;
}

async function testOne(id) {  
    creator_id1 = mongoose.Types.ObjectId("62bbb1f50302baa523d2471a");
    creator_id2 = mongoose.Types.ObjectId("62bbb1f50302baa523d2471b");
    sleep_time = 1000;
    let delays = [];

    //创建规则，创建者为62bbb1f50302baa523d2471a
    // console.log("创建规则：" + id);
    // testCreate(id,creator_id1);
    delays.push(await getDelay(async () => { await testCreate(id, creator_id1); }))
    await sleep(sleep_time);

    //查询规则，此时应该查询数据库并写入缓存
    delays.push(await getDelay(async () => {await testGetById(id);}))
    // rule = await testGetById(id);
    // console.log("creator_id:",rule.creator_id.toString())
    await sleep(sleep_time);

    //再次查询规则，此时应该读缓存
    delays.push(await getDelay(async () => {await testGetById(id);}))
    // rule = await testGetById(id);
    // console.log("creator_id:",rule.creator_id.toString())
    await sleep(sleep_time);

    //修改规则，将创建者修改为62bbb1f50302baa523d2471b
    // console.log("修改规则：" + id);
    delays.push(await getDelay(async () => {await testUpdate(id,creator_id2);}))
    // testUpdate(id,creator_id2);
    await sleep(sleep_time);

    //查询规则，此时缓存数据应被删除，将查询数据库
    delays.push(await getDelay(async () => {await testGetById(id);}))
    // rule = await testGetById(id);
    // console.log("creator_id:",rule.creator_id.toString())
    await sleep(sleep_time);

    //再次查询规则，此时应该读缓存
    delays.push(await getDelay(async () => {await testGetById(id);}))
    // rule = await testGetById(id);
    // console.log("creator_id:",rule.creator_id.toString())
    await sleep(sleep_time);

    //删除规则
    // console.log("删除规则：" + id);
    delays.push(await getDelay(async () => {await testDelete(id);}))
    // testDelete(id);
    await sleep(sleep_time);

    //查询规则，此时结果应为null
    delays.push(await getDelay(async () => {await testGetById(id);}))
    // rule = await testGetById(id);
    // console.log(rule);

    return delays;
}

async function testMuti(id) {  
    creator_id1 = mongoose.Types.ObjectId("62bbb1f50302baa523d2471a");
    creator_id2 = mongoose.Types.ObjectId("62bbb1f50302baa523d2471b");
    sleep_time = 1000;

    //创建规则,id为10000，name为test_10000
    console.log("创建规则：" + id);
    testCreate(id,creator_id1);
    await sleep(sleep_time);

    //使用id查询规则，此时应该查询数据库并使用id作为key写入缓存
    rule = await testGetById(id);
    console.log("id:",rule.rule_id,"name:",rule.rule_name,"creator_id:",rule.creator_id.toString())
    await sleep(sleep_time);

    //使用name查询规则，此时应该查询数据库并使用id作为key写入缓存
    rule = await testGetByName("test_"+id);
    console.log("id:",rule.rule_id,"name:",rule.rule_name,"creator_id:",rule.creator_id.toString())
    await sleep(sleep_time);

    //修改规则，将创建者修改为62bbb1f50302baa523d2471b
    console.log("修改规则：" + id);
    testUpdate(id,creator_id2);
    await sleep(sleep_time);

    //再次使用id查询规则，此时id的缓存数据应被删除，将查询数据库
    rule = await testGetById(id);
    console.log("id:",rule.rule_id,"name:",rule.rule_name,"creator_id:",rule.creator_id.toString())
    await sleep(sleep_time);

    //再次使用name查询规则，此时name的缓存数据也被删除，将查询数据库
    rule = await testGetByName("test_"+id);
    console.log("id:",rule.rule_id,"name:",rule.rule_name,"creator_id:",rule.creator_id.toString())
    await sleep(sleep_time);

    //删除规则
    console.log("删除规则：" + id);
    testDelete(id);
    await sleep(sleep_time);

    //查询规则，此时结果应为null
    rule = await testGetById(id);
    console.log(rule);
}

async function testPerformance() {  
    const promiseList = [];
    for (let i = 10000; i < 10500; i++){
        id = i.toString();
        promiseList.push(testOne(id));
    }
    delays = await Promise.all(promiseList);
    avg_delay = [];
    for (j = 0; j < delays[0].length; j++) { avg_delay.push(0); }
    for (i = 0; i < delays.length; i++){
        for (j = 0; j < delays[i].length; j++){
            avg_delay[j] += delays[i][j];
        }
    }
    for (j = 0; j < delays[0].length; j++) { avg_delay[j]/=delays.length; }
    return avg_delay;
}

async function test() {
        await cacheService.init();
    delays = await testPerformance();
    console.log(delays);
    }

//test()