export interface Repository<TEntity, TIdentifier = string> {
  findById(id: TIdentifier): Promise<TEntity | null>;
}
