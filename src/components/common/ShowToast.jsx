import { useEffect } from "react";

//internal import
import { notifyError, notifySuccess } from "@utils/toast";

const ShowToast = ({ success, error }) => {
  useEffect(() => {
    if (success) {
      notifySuccess(success);
    }
    if (error) {
      notifyError(error);
    }
  }, [success, error]);

  return null;
};

export default ShowToast;
