const Account = require('../models/account');

const httpActionMap = {
  POST: 'create',
  GET: 'read',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete'
};

exports.authorize = (moduleName, actionOverride) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Chưa đăng nhập' });
      }

      const account = await Account.findById(req.user.id).populate('roleId');
      if (!account || !account.roleId) {
        return res.status(403).json({ message: 'Không tìm thấy vai trò người dùng' });
      }

      const role = account.roleId;
      const action = actionOverride || httpActionMap[req.method];

      // Trường hợp người dùng patient truy cập chính họ, cho phép dù chưa cấu hình permissions
      if (moduleName === 'patient' && action === 'read') {
        const accountIdParam =
          req.params.accountId ||
          req.params.id ||
          (req.path.match(/\/account\/([^\/]+)/) || [])[1] ||
          (req.path.match(/\/([a-fA-F0-9]{24})/) || [])[1];

        if (accountIdParam && accountIdParam.toString() === req.user.id.toString()) {
          return next();
        }
      }

      const hasPermission = role.permissions.some(
        p => p.module === moduleName && p.actions.includes(action)
      );

      if (!hasPermission) {
        return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
      }

      next();
    } catch (err) {
      console.error('Authorization error:', err);
      res.status(500).json({ message: 'Lỗi phân quyền' });
    }
  };
};
