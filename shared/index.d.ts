declare global {
    namespace shared {
        export type { IUser, ITicket };
        export default import('./logger').default;
    }
}
