import { Button } from "@components/ui/button";
import { useFormStatus } from "react-dom";

const SubmitButton = ({ title }) => {
  const { pending } = useFormStatus();

  return (
    <>
      {
        <Button
          disabled={pending}
          type="submit"
          variant="create"
          // className="md:text-sm leading-5 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-medium text-center justify-center border-0 border-transparent rounded-md placeholder-white focus-visible:outline-none focus:outline-none bg-cyan-600 text-white px-5 md:px-6 lg:px-8 py-2 md:py-3 lg:py-3 hover:text-white hover:bg-cyan-700 h-12 mt-1 text-sm lg:text-sm w-full sm:w-auto"
        >
          {pending ? "Processing" : title}
        </Button>
      }
    </>
  );
};

export default SubmitButton;
