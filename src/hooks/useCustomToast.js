import { useEffect, useRef } from "react";

//internal imports
import { notifyError, notifySuccess } from "@utils/toast";

const useCustomToast = (state) => {
  const formRef = useRef();
  useEffect(() => {
    if (state?.error) {
      notifyError(state.error);
    }
    if (state?.success) {
      notifySuccess(state.success);
      formRef?.current?.reset();
    }
  }, [state]); // Only re-run the effect if state changes
  return { formRef };
};

export default useCustomToast;
