const { router } = require('../../config/express-custom.config');
const { responsePresenter } = require('../../config/reponse.config');
const { checkAccount } = require('../services/account.service');
const { validateInputAccount } = require('../middlewares/validator.middleware');
const { logError } = require('../../config/fs.config');
const { responseMeta } = require('../../config/meta.config');

router.post('/login', [validateInputAccount], async (req, res) => {
    try {
        const {name,password}=req.body;
        const account = await checkAccount(name,password)
        return res.send(responsePresenter(
            { token: account },
            responseMeta()
        ));
    }
    catch (error) {
        logError(error, '/admin/login')
        return res.send(error);
    }
})

module.exports = router;