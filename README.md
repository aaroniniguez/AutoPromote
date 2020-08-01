# Auto Promote

Enables you to programmatically manage your Twitter account:    
  - Tweet with/without image
  - Follow/unfollow random users
  - SMS alert on dm request 
  - Track account suspensions
  - Followers/Following metrics
  - Update profile information
	- Update website field

Multiple account management: 
 - Uses a LIFO (based on last tweeted timestamp) approach to tweeting promotional material
 - Utilizes cron jobs via a scheduler database to tweet promotions (LIFO based) using a LIFO selected promoter

## Installation
```
npm install -g puppeteer --unsafe-perm=true
```
To install chrome dependencies on Amazon Linux AMI 
```
bash installer.sh
```

Compile the project: 
```
npm install
npm run compile
```

Then add the following cron job: 
```
* * * * * /usr/local/bin/node /Users/aaroniniguez/AutoPromote/dist/scheduler.js > /tmp/testing 2>&1
```
