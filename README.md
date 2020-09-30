# xfans project

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7
- [Bower](bower.io) (`npm install --global bower`)
- [Ruby](https://www.ruby-lang.org) and then `gem install sass`
- [Gulp](http://gulpjs.com/) (`npm install --global gulp`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`
- [ffmpeg](https://ffmpeg.org/)
- [graphic magick](http://www.graphicsmagick.org/)

### Developing

1. Run `npm install` to install server dependencies.

2. Run `bower install` to install front-end dependencies.

3. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running

4. Run `gulp serve` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `grunt build` for building and `grunt serve` for preview.

## Testing

Running `npm test` will run the unit tests with karma.


## Set up ccbill
1. Login to CCBill account and create sub account
2. Select your sub account > Click menu Account info > Main account > Select `View sub account info` in the left menu > Click `Advanced` in the left menu. In the ` Approval Post URL` please enter url https://your-app.com/api/v1/ccbill/hook
3. In the left menu > click Basic and enter `Approval URL` is https://your-app.com/buy-success. This is url CCBill will redirect after purchased successfully
4. Click on `pricing admin` in the left menu, and enter price. You can see `Recurring payment type ` or `Single payment price` in the dropdown, please create all prices you need (for monthly, yearly recurring)
5. Click Flexforms system > Click add new. Enter name, description, tick on `Allow for Dynamic Prices to be passed to form`, copy this ID under form details, it looks like `bf7eca81-fa87-4434-bfca-36d6f95d012f`. you can create multiple flexform you need (remember promote to live)
6. Go to admin panel > settings > edit settings > enter CCBill salt key into 2 `Salt` fields of recurring and single payment
7. Go to admin panel > models > edit model > scroll down to bottom and you will see a section to edit CCBill infor for model. Please enter all related data into those forms `Flexform ID for monthly subscritpion`, `Flexform ID for yearly subscription`, `Flexform ID for single payment`, `Sub account number (eg 0001)`. Then save
8. Go to frontend, login with user account and try to test
