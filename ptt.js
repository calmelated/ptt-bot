const request = require("request");
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
const POLLING_TIME = 600 * 1000; // every 10 minutes

const targetList = [
  { url: 'https://www.ptt.cc/bbs/cat/index.html', keyword: [['高雄', '認養']], list: {} },
  { url: 'https://www.ptt.cc/bbs/Taipei/index.html', keyword: [['贈送'],['中和|北部','Asus']], list: [] },
];

const transporter = nodemailer.createTransport({
  host: 'your-mail-server.com.tw',
  port: 25,
  secureConnection: false,
  connectionTimeout: 20000,
  auth: {
    user: 'your-account',
    pass: 'your-password',
  },
});

const email = (subject, message) => {
  return new Promise((resolve, reject) => {
    transporter.sendMail({
      from: 'PTT Bot <noreply@your-mail-server.com.tw>', 
      to: 'your-destination@gmail.com',
      subject: subject, 
      html: message, 
    }, (error, info) => {
      return error ? reject(error) : resolve(info);
    });
  });
};

const getList = (target) => { 
  return new Promise((resolve, reject) => {
    request({ 
      method: 'GET', 
      url: target.url 
    }, (error, response, body) => {
      if (error) {
        return reject(error);
      }
      let result = {};
      let $ = cheerio.load(body);
      let lists = $('.r-list-container .r-ent');
      for(let i = 0; i < lists.length; i++) {
        let id = $(lists[i]).find('.title a').attr('href');
        if(!id) { 
          continue; 
        }
        id = id.split('/');
        id = id[id.length - 1];
        result[id] = {
          id: id,
          title: $(lists[i]).find('.title').text().trim(),
          nrec: $(lists[i]).find('.nrec').text(),
          mark: $(lists[i]).find('.mark').text(),
          date:  $(lists[i]).find('.meta .date').text(),
          author: $(lists[i]).find('.meta .author').text(),
        };
      }
      // console.log('List ');
      // console.dir(result);
      return resolve(result);
    });
  });
};

const getUpdates = (target, nList) => {
  let result = [];
  Object.keys(nList).forEach((id) => {
    if(!target.list[id]) {
      result.push(nList[id]);
    }
  });
  // console.log('Updated: ');
  // console.dir(result);
  return result;
};

const matchTarget = (title, rules) => {
  for(let i = 0; i < rules.length; i++) {
    let allMatch = true;
    for(let j = 0; j < rules[i].length; j++) {
      if(!title.match(rules[i][j])) {
        allMatch = false;
        break;
      }
    }
    if(allMatch) {
      return true;
    }
  }
  return false;
};

const main = async() => {
  for(let i = 0; i < targetList.length; i++) {
    let target = targetList[i];
    try {
      let curList = await getList(target); 
      let updateList = getUpdates(target, curList);
      for(let j = 0; j < updateList.length; j++) {
        let update = updateList[j];
        if(matchTarget(update.title, target.keyword)) {
          console.log('Keyword=' + target.keyword + ', Link=' + target.url.match(/.*\//) + update.id + ', Title=' + update.title);
          await email(update.title, target.url.match(/.*\//) + update.id);
        }
      }
      target.list = curList;
    } catch(e) {
      console.log(target.url + ' Not found!');
      console.log(e);
    }
  }
  return setTimeout(main, POLLING_TIME);
};

main();
