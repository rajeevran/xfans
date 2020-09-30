/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import {
  UserModel,
  SettingModel
} from '../models';
import async from 'async';

module.exports = (cb) => {
  async.waterfall([
    (cb) => {
      UserModel.find({})
        .remove()
        .then(() => {
          UserModel.create({
              provider: 'local',
              name: 'Test User',
              email: 'test@example.com',
              password: 'test',
              emailVerified: true,
              status: 'active'
            }, {
              provider: 'local',
              role: 'admin',
              name: 'Admin',
              email: 'admin@example.com',
              password: 'admin',
              emailVerified: true,
              status: 'active'
            })
            .then(() => {
              console.log('finished populating users');
              cb();
            });
        });
      SettingModel.find({})
        .remove()
        .then(() => {
          SettingModel.create({
            metaTitle: "Xfans",
            metaDescription: "Xfans is a social media platform for you to see the explosive content from your favorite models. Abetter platform than you are used too. come try it and find out!!",
            metaKeyword: "sex, sex tour, video sex, video sex full hd,gay,onlyfans,only,just,fans",
            companyName: "Thank you so much for your imput.",
            address: "Please fill out the info below and someone will get back to you ASAP",
            welcomeContent: "<p><big><em><strong>Xfans allows you to make money off of your social media by charging a mothly subscription for your content.</strong>&nbsp;</em></big></p>\n\n<ul>\n\t<li>\n\t<p><em><strong>Fan Store</strong></em> for you to sell your products on.</p>\n\t</li>\n\t<li>\n\t<p><em><strong>Seperate Area</strong></em> to sell extra special content within your page</p>\n\t</li>\n\t<li>\n\t<p><em><strong>Naming</strong></em> and <strong><em>Tagging</em></strong> your content for easy search capability</p>\n\t</li>\n\t<li>\n\t<p><em><strong>Statistic Analisis</strong></em>. know what your content is doing to better grow your audience</p>\n\t</li>\n\t<li>\n\t<p>Real time <em><strong>Messaging</strong></em> with subscribers</p>\n\t</li>\n\t<li>\n\t<p><em><strong>Bulk Uploading</strong></em> for video and photo content</p>\n\t</li>\n\t<li>80% commission paid to you weekly</li>\n</ul>\n",
            footerContent: "<p>Copyright &copy; 2016 . <a href=\"http://Xfans/pages/terms-of-service\" target=\"_self\">Terms of Service</a>, <a href=\"http://Xfans/pages/privacy-policy\" target=\"_self\">Privacy Policy,</a>&nbsp;<a href=\"http://Xfans/pages/dcma\" target=\"_self\">DCMA,</a>&nbsp;<a href=\"http://Xfans/pages/2257\">2257</a>, <a href=\"http://Xfans/pages/cancelation-policy\" target=\"_self\">Cancelation</a>&nbsp;,&nbsp;<a href=\"/affiliate_program.html\" target=\"_blank\">Affiliate Program</a></p>\n",
            email: "",
            __v: 0,
            landingPageContent: "<p>This Website contains and displays sexually explicit content, including images, videos, sounds, text, and links. Please leave the Website immediately if: (a) you are less than 18-years old or the age of majority where you will or may view the content; (b) any portion of the content offends you; or (c) viewing or downloading the content is illegal in the community where you choose to view or download it.</p>\n\n<p><strong>Permission to enter the Website and to view and download its contents is strictly limited only to consenting adults who affirm that the following statements are true:</strong></p>\n\n<p>I am at least 18-years old or the age of legal majority where I live (whichever is greater), and that I am voluntarily choosing to view and access the sexually-explicit images and content for my own personal use and entertainment;</p>\n\n<p>I will not expose any minors or third parties to sexually explicit content I am about to view;</p>\n\n<p>I understand that the content on the Website is sexually explicit in nature and depicts adults engaged in consensual sex;</p>\n\n<p>It is my constitutional right to receive, view, and download the content;</p>\n\n<p>I believe that sexual acts between consenting adults are neither offensive nor obscene and I desire to view or download the content;<br />\nThe viewing, reading, and downloading of sexually explicit materials does not violate the standards of any community, town, city, state, or country where I will view, read, or download the content;</p>\n\n<p>I will not sell, distribute, give, or make available the content on this Website to anyone and I will take the appropriate steps in order to make sure no minor is able to view the content available on this Website;</p>\n\n<p>I am solely responsible for any false disclosures or legal ramifications of viewing, reading or downloading any of the content on the Website. Further, neither the Website nor its affiliates, agents, and operators will be held responsible for any legal ramifications arising from any fraudulent entry into or use of the Website;</p>\n\n<p>I understand that the content on the Website is meant to serve as a visual record of the methods of interpersonal and sexual relationships, but that these fictional accounts do not always exhibit safe sex, or the full range of real life emotions and relationships;</p>\n\n<p>I understand and agree that my use of the Website is governed by the Website&#39;s Terms of Use, and the Website&#39;s Privacy Policy, which I have carefully reviewed and accepted, and I agree I am legally bound by the Terms of Use and Privacy Policy;</p>\n\n<p>I agree that by entering the Website, I am subjecting myself to the personal jurisdiction of the Turks and Caicos Islands, should any dispute arise at any time between the Website and myself according to the Website&#39;s Terms of Use ;</p>\n\n<p>I agree that by entering the Site, I am subjecting myself to binding arbitration, should any dispute arise at any time between the Website and myself according to the Website&#39;s Terms of Use ; and</p>\n\n<p>I agree that this warning page forms an agreement between me and the Website and by choosing to click on &quot;Agree &amp; Enter&quot;, and indicating my agreement to be bound by the terms of this agreement, the Terms of Use, and the Privacy Policy, I consent to be bound by the terms of this warning page, the Terms of Use, and the Privacy Policy.</p>\n\n<p>&nbsp;</p>\n\n<p><strong>click here to see more :&nbsp;<a href=\"http://viid.me/qeHu9D\">http://viid.me/qeHu9D</a></strong></p>\n",
            imageHomeFullPath: "",
            imageWelcomeFullPath: "",
            clientAccnumSingle: "948332",
            clientAccnumSubscriptions: "948332",
            clientSubaccSingle: "0004",
            clientSubaccSubscriptions: "0003",
            currencyCodeSingle: "840",
            currencyCodeSubscriptions: "840",
            formNameSingle: "",
            formNameSubscriptions: "",
            saltSingle: "",
            saltSubscriptions: "",
            imageMemberNotVip: "",
            hotline: "",
            mailchimp: {
              active: true,
              apiKey: "",
              listId: ""
            },
            fullAccessVideoText: {
              text1: "",
              text2: "",
              icon: ""
            },
            welcomeTitle: "BECOME A MODEL ON Xfans",
            color: {
              enable: false,
              buttonBorder: "#dce00b",
              buttonHover: "#4f1010",
              button: "#dce00b",
              linkHover: "#0075ff",
              link: "#dce00b",
              lines: "#dce00b",
              main: "#878e99"
            },
            bitpay: {
              enable: false,
              apiKey: "",
              sandbox: false
            },
            siteName: "xFans",
            storeComission: 20,
            subscriptionCommision: 20,
            tipCommision: 20,
            logoFullPath: "",
            paypal: {
              enable: false,
              signature: "",
              password: "",
              username: "",
              sandbox: true
            },
            imageLoginFullPath: "",
            ccbillEnable: false,
            favicon: "",
            videoWatermarkPath: "",
            ccbill: {
              subTokenPackage: "",
              formSinglePayment: ""
            },
            streamCommission: 1
          })
        })
    }
  ], () => {
    cb();
  });
};
