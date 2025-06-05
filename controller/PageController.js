export const getMainPage = (req, res) => {
  const msg = req.query.msg || null;
  res.render("main", { session: req.session, msg });
};

export const getMyPage = (req, res) => {
  res.render("myPage");
};

export const getAdminPage = (req, res) => {
  res.render("adminPage");
};
