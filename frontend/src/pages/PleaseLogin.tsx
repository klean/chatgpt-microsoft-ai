import styles from "./PleaseLogin.module.css";

const PleaseLogin = () => {
  // @ts-ignore
  return (
      <>
        <div className={styles.container}>
          <div className={styles.div}>
            <h1 className={styles.headline}>FU Chatbot</h1>
            <p className={styles.description}>Brug dit personlige link for at få adgang til FU chatbotten</p>
          </div>
        </div>
      </>
  )
}

export default PleaseLogin
