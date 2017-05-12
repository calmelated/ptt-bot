# ptt-bot
A robot helps to parse some keyword on PTT.cc, and then sends an email to your target users.

### Setup & Usage
 
 - `git clone` this project to your linux machine
 - `npm install` to install the required node.js modules 
 - Edit the file ptt.js
 - Fill in your parsing rules
 - Fill in your SMTP server address and authenication information
 - Run the code `node ptt.js`

 ```sh
 user@server:~/ptt-bot$ node ptt.js 
 Keyword=板規, Link=https://www.ptt.cc/bbs/job/M.1297170305.A.D86.html, Title=[公告] 2017年1/12增修板規  罰則修訂
 ...
 ...
 
 ```  


### My test environment
 - Ubuntu 16.04 
 - Node.js 7.x (needs async/awit support)

