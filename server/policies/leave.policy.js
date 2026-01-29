exports.getPolicy = (role) => {
  switch (role) {
    case "faculty":
    case "hod":
      return { casual: 12, earned: 6, rh: 2 };

    case "staff":
      return { casual: 10, earned: 4, rh: 2 };

    case "principal":
    case "admin":
      return { casual: 0, earned: 0, rh: 0 };

    default:
      return { casual: 0, earned: 0, rh: 0 };
  }
};
