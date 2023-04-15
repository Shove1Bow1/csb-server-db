const { router } = require('../../config/express-custom.config');
const { responsePresenter } = require('../../config/reponse.config');
const { checkAccount } = require('../services/account.service');
const { validateInputAccount } = require('../middlewares/validator.middleware');
const { logError } = require('../../config/fs.config');

router.post('/admin/login', [validateInputAccount], async (req, res) => {
    try {
        const account = await checkAccount(req.body.name, req.body.password)
        res.send(responsePresenter(
            { token: account }
        ));
    }
    catch (error) {
        logError(error, '/admin/login')
        res.send(error);
    }

})

module.exports = router;