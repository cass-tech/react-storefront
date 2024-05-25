"use client";

import { useEffect } from "react";
import { payfastGatewayId } from "./types";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useTransactionInitializeMutation } from "@/checkout/graphql";
import { useAlerts } from "@/checkout/hooks/useAlerts";
import { useErrorMessages } from "@/checkout/hooks/useErrorMessages";
import { apiErrorMessages } from "@/checkout/sections/PaymentSection/errorMessages";
import { CheckoutForm } from "@/checkout/sections/PaymentSection/PayfastElements/payfastElementsForm";
import { getUrlForTransactionInitialize } from "@/checkout/sections/PaymentSection/utils";

export const PayfastComponent = () => {
	const { checkout } = useCheckout();

	const [transactionInitializeResult, transactionInitialize] = useTransactionInitializeMutation();
	const payfastData = transactionInitializeResult.data?.transactionInitialize?.data as
		| undefined
		| {
				paymentIntent: {
					id: string;
					m_payment_id: string;
					payment_url: string;
				};
		  };

	const { showCustomErrors } = useAlerts();
	const { errorMessages: commonErrorMessages } = useErrorMessages(apiErrorMessages);

	useEffect(() => {
		transactionInitialize({
			checkoutId: checkout.id,
			paymentGateway: {
				id: payfastGatewayId,
				data: {
					return_url: getUrlForTransactionInitialize()?.newUrl,
				},
			},
		}).catch((err) => {
			console.error(err);
			showCustomErrors([{ message: commonErrorMessages.somethingWentWrong }]);
		});
	}, [checkout.id, commonErrorMessages.somethingWentWrong, showCustomErrors, transactionInitialize]);

	if (!payfastData) {
		return null;
	}

	return <CheckoutForm payfastData={payfastData} />;
};
