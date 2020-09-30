module.exports =
    '<body style="padding: 0;margin: 0;font-family: Arial, Helvetica, sans-serif;">\
        <div style="width:600px;margin:0 auto;background-image: url({{ site_url }}uploads/email_template/top_bg.png);background-repeat: no-repeat;">\
            <div ><img height="280px" width="100%" style="margin-top: 5%;  zoom:50%;" src="{{ site_url }}uploads/email_template/logo.png" alt="ezfoodie-logo"></div>\
            <hr style="width: 83%;height: 1px; margin-top: 5%;background-color: #e9e9e9; border: 0; border-top: 1px solid #e9e9e9;">\
            <div style="margin-top: -13px;margin-bottom: 42px; font-size: 14px;">\
            <p>Hi, {{ name }}</p>\
            <p>Your Password has been changed successfully.</p>\
            <p>Your New Password is {{ reset_password }}</p>\
            </div>\
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-image: url({{ site_url }}uploads/email_template/footer_bg.png); height: 100px; text-align: center;">\
                <tbody>\
                    <tr>\
                        <td style="text-align: center;">\
                            <img style="padding-left:13px;margin-top: 19px;" src="{{ site_url }}uploads/email_template/facebook.png">\
                            <img style="padding-left: 13px;margin-top: 19px;" src="{{ site_url }}uploads/email_template/instagram.png">\
                        </td>\
                    </tr>\
                </tbody>\
            </table>\
        </div>\
    </body>';