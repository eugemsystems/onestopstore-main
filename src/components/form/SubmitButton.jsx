import { Button } from "@components/ui/button";
import { useFormStatus } from "react-dom";

const SubmitButton = ({ title }) => {
  const { pending } = useFormStatus();
  // console.log("pending", pending);
  return (
    <>
      <Button
        disabled={pending}
        isLoading={pending}
        loadingText="Processing"
        variant="create"
        type="submit"
        // className="w-full cursor-pointer text-center py-3 rounded bg-cyan-600 text-white hover:bg-cyan-700 transition-all focus:outline-none my-1"
      >
        {title}
      </Button>
    </>
  );
};

export default SubmitButton;
