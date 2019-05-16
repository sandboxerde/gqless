import { Selection, RootSelection } from '../Selection'

export class QueryBatcher {
  private timer: any
  private commits = new Set<Selection<any, any>>()

  constructor(
    private fetchSelections: (selections: Selection<any>[]) => Promise<any>,
    public interval: number = 50
  ) {
    this.startTimer()
  }

  public stage(selection: Selection<any, any>) {
    if (this.commits.has(selection)) return
    this.commits.add(selection)
  }

  public unstage(selection: Selection<any, any>) {
    this.commits.delete(selection)
  }

  public async fetchCommits() {
    if (!this.commits.size) return
    const commits = Array.from(this.commits)

    this.commits.clear()

    try {
      await this.fetchSelections(commits)
    } catch {}
  }

  public startTimer() {
    this.stopTimer()
    this.timer = setTimeout(async () => {
      this.fetchCommits()
      this.startTimer()
    }, this.interval)
  }

  public stopTimer() {
    if (!this.timer) return

    clearTimeout(this.timer)
    this.timer = null
  }

  public dispose() {
    this.stopTimer()
  }
}
