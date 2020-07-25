# Auto Promote

Enables you to programmatically manage your Twitter Account:    
  - tweet with/without image
  - follow/unfollow random users
  - SMS alert on dm request 
  - Track Account Suspensions
  - Followers/Following Metrics
  - Update Profile Information
	- Update website

Manage multiple accounts by: 
 - Uses a LIFO (based on last tweeted timestamp) approach to tweeting promotional material
 - utilizes cron jobs via a scheduler database to tweet promotions (which can have multiple promoters)

## Installation
```
npm install -g puppeteer --unsafe-perm=true
```
To install chrome dependencies on Amazon Linux AMI 
```
bash installer.sh
```

Add the following cron job: 
```
* * * * * /usr/local/bin/node /Users/aaroniniguez/AutoPromote/dist/scheduler.js > /tmp/testing 2>&1
```
