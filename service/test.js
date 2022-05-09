console.log("原时间 " + new Date());
 
time = TimeZone.getTimeZone("Etc/GMT-8");  //转换为中国时区
 
TimeZone.setDefault(time);
 
console.log("修改后时间 " + new Date());
