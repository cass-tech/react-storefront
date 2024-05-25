import { type FormEventHandler, useEffect, useState } from "react";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useUser } from "@/checkout/hooks/useUser";
import { useAlerts } from "@/checkout/hooks/useAlerts";
import {
	areAnyRequestsInProgress,
	hasFinishedApiChangesWithNoError,
	useCheckoutUpdateState,
	useCheckoutUpdateStateActions,
} from "@/checkout/state/updateStateStore";
import {
	anyFormsValidating,
	areAllFormsValid,
	useCheckoutValidationActions,
	useCheckoutValidationState,
} from "@/checkout/state/checkoutValidationStateStore";
import { usePaymentProcessingScreen } from "@/checkout/sections/PaymentSection/PaymentProcessingScreen";
import { useCheckoutComplete } from "@/checkout/hooks/useCheckoutComplete";
import { getQueryParams } from "@/checkout/lib/utils/url";
import { useEvent } from "@/checkout/hooks/useEvent";

export function CheckoutForm({
	payfastData,
}: {
	payfastData: { paymentIntent: { id: string; m_payment_id: string; payment_url: string } };
}) {
	const [isLoading, setIsLoading] = useState(false);

	const { checkout } = useCheckout();
	const { authenticated } = useUser();
	const { showCustomErrors } = useAlerts();

	const checkoutUpdateState = useCheckoutUpdateState();
	const anyRequestsInProgress = areAnyRequestsInProgress(checkoutUpdateState);
	const finishedApiChangesWithNoError = hasFinishedApiChangesWithNoError(checkoutUpdateState);
	const { setSubmitInProgress, setShouldRegisterUser } = useCheckoutUpdateStateActions();
	const { validateAllForms } = useCheckoutValidationActions();
	const { validationState } = useCheckoutValidationState();

	const { setIsProcessingPayment } = usePaymentProcessingScreen();
	const { onCheckoutComplete, completingCheckout } = useCheckoutComplete();

	// handler for when user presses submit
	const onSubmitInitialize: FormEventHandler<HTMLFormElement> = useEvent(async (e) => {
		e.preventDefault();
		setIsLoading(true);
		validateAllForms(authenticated);
		setShouldRegisterUser(true);
		setSubmitInProgress(true);
		window.location.href = payfastData.paymentIntent.payment_url;
	});

	// handle when page is opened from previously redirected payment
	useEffect(() => {
		const { processingPayment } = getQueryParams();

		console.log("processingPayment", processingPayment);
		console.log("completingCheckout", completingCheckout);
		if (!processingPayment) {
			return;
		}
		if (!completingCheckout) {
			void onCheckoutComplete();
		}
	}, [completingCheckout, onCheckoutComplete]);

	useEffect(() => {
		const validating = anyFormsValidating(validationState);
		const allFormsValid = areAllFormsValid(validationState);

		console.log("checkoutUpdateState", checkoutUpdateState);

		if (!checkoutUpdateState.submitInProgress || validating || anyRequestsInProgress) {
			return;
		}

		// submit was finished - we can mark it as complete
		setSubmitInProgress(false);

		// there was en error either in some other request or form validation
		// - stop the submission altogether
		if (!finishedApiChangesWithNoError || !allFormsValid) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
	}, [
		anyRequestsInProgress,
		checkout.billingAddress?.city,
		checkout.billingAddress?.country.code,
		checkout.billingAddress?.countryArea,
		checkout.billingAddress?.firstName,
		checkout.billingAddress?.lastName,
		checkout.billingAddress?.phone,
		checkout.billingAddress?.postalCode,
		checkout.billingAddress?.streetAddress1,
		checkout.billingAddress?.streetAddress2,
		checkout.email,
		checkoutUpdateState.submitInProgress,
		finishedApiChangesWithNoError,
		onCheckoutComplete,
		setIsProcessingPayment,
		setSubmitInProgress,
		showCustomErrors,
		validationState,
	]);

	return (
		<form className="my-8 flex flex-col gap-y-6" onSubmit={onSubmitInitialize}>
			<div className="flex justify-between">
				<img
					className="inline"
					alt="visa"
					src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/0169695890db3db16bfe.svg"
					role="img"
					width="38"
					height="24"
				/>
				<img
					className="inline"
					alt="master"
					src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/5e3b05b68f3d31b87e84.svg"
					role="img"
					width="38"
					height="24"
				/>
				<img
					className="inline"
					alt="payfast instant eft"
					src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/312fbdb3765a042c6178.svg"
					role="img"
					width="38"
					height="24"
				/>
				<img
					className="inline"
					alt="mobicred"
					src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/78089f5a451bc44c9798.svg"
					role="img"
					width="38"
					height="24"
				/>
				<img
					className="inline"
					alt="zapper"
					src="https://cdn.shopify.com/shopifycloud/checkout-web/assets/ee93db95c51afcdea0da.svg"
					role="img"
					width="38"
					height="24"
				/>
			</div>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="-252.3 356.1 163 80.9" className="eHdoK">
				<path
					fill="none"
					stroke="currentColor"
					strokeMiterlimit="10"
					strokeWidth="2"
					d="M-108.9 404.1v30c0 1.1-.9 2-2 2H-231c-1.1 0-2-.9-2-2v-75c0-1.1.9-2 2-2h120.1c1.1 0 2 .9 2 2v37m-124.1-29h124.1"
				></path>
				<circle cx="-227.8" cy="361.9" r="1.8" fill="currentColor"></circle>
				<circle cx="-222.2" cy="361.9" r="1.8" fill="currentColor"></circle>
				<circle cx="-216.6" cy="361.9" r="1.8" fill="currentColor"></circle>
				<path
					fill="none"
					stroke="currentColor"
					strokeMiterlimit="10"
					strokeWidth="2"
					d="M-128.7 400.1H-92m-3.6-4.1 4 4.1-4 4.1"
				></path>
			</svg>
			<div>
				<p>After clicking “Pay now”, you will be redirected to Payfast to complete your purchase securely.</p>
			</div>
			<button
				id="submit"
				aria-disabled={isLoading}
				className="h-12 items-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium leading-6 text-white shadow hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 hover:aria-disabled:bg-neutral-700"
			>
				<span className="button-text">{isLoading ? <Loader /> : "Pay now"}</span>
			</button>
		</form>
	);
}

function Loader() {
	return (
		<div className="text-center" aria-busy="true" role="status">
			<div>
				<svg
					aria-hidden="true"
					className="mr-2 inline h-6 w-6 animate-spin fill-neutral-600 text-neutral-100 dark:text-neutral-600"
					viewBox="0 0 100 101"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
						fill="currentColor"
					/>
					<path
						d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
						fill="currentFill"
					/>
				</svg>
				<span className="sr-only">Loading...</span>
			</div>
		</div>
	);
}
