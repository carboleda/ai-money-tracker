export interface Service<Input, Output> {
  execute(input: Input): Promise<Output>;
}
