import Toast from "react-native-toast-message"

export const ShowSuccessMessage = (message: string) => {
    Toast.show({
        type: "success",
        text1: "Sucess",
        text1Style: {
            textAlign: "center",
            fontSize:18
        },
        text2: message,
        text2Style: {
            fontSize: 14
        }
    })
}

export const ShowErrorMessage = (message: string) => {
    Toast.show({
        type: "error",
        text1: "Error",
        text1Style: {
            textAlign: "center",
            fontSize:18
        },
        text2: message,
        text2Style: {
            fontSize: 14
        }
    })
}

export const ShowInfoMessage = (message: string) => {
    Toast.show({
        type: "info",
        text1: "Info",
        text1Style: {
            textAlign: "center",
            fontSize:18
        },
        text2: message,
        text2Style: {
            fontSize: 14
        }
    })
}