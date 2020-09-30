module.exports =
    '<body style="padding: 0;margin: 0;font-family: Arial, Helvetica, sans-serif;">\
    <div style="width:600px;margin:0 auto;background-image: url({{ site_url }}uploads/email_template/top_bg.png);background-repeat: no-repeat; text-align: center;">\
        <img width="100%" style="margin-top: 5%; zoom:50%;" src="{{ site_url }}uploads/email_template/logo.png" alt="calaf-logo">\
        <div style="margin-top: 8%;text-align: center;">\
            <ul style="list-style: none;">\
                <li style="color:#827f9e;font-size: 20px;">Welcome, {{ name }},</li>\
                <li>Thank you for register . please click given link.</b></li>\
                <li style="margin-top:10px; font-size: 150%;"><a href={{ emailVerifyLink }} /></li>\
            </ul>\
        </div>\
        <div style = "width: 100%; margin: 0 auto;">\
            <span style = "background-image: url({{ site_url }}uploads/email_template/button.png); height: 83px; display: flex; background-repeat: no-repeat; width: 100%; background-position: center;" >\
                <a style = "text-decoration: none; color:white; font-weight: 600;margin: 0 auto;margin-top: 30px;font-size: 17px;" > Start a new order </a>\
            </span>\
        </div>\
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-image: url({{ site_url }}uploads/email_template/footer_bg.png); height: 100px; text-align: center;">\
            <tbody>\
                <tr>\
                    <td style="text-align: center;">\
                    You subscribed to receive email notifications from {{ site_url }}\
                    </td>\
                </tr>\
            </tbody>\
        </table>\
    </div>\
</body>';