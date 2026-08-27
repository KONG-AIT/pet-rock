import { describe, expect, it, vi } from 'vitest'
import type { GameState } from '../domain'
import {
  ROCK_SHARE_DEEP_LINK,
  createAppsInTossShareService,
  createBrowserShareService,
  createRockShareModel,
  createRockShareService,
  createRockShareText,
  isAppsInTossRuntime,
  shareRock,
  type AppsInTossShareApi,
  type RockShareService,
  type ShareResult,
} from '.'

function gameState(equippedPlant: 'plant-02' | null = null): GameState {
  return {
    rock: { id: 'rock-03', name: '몽돌' as GameState['rock']['name'], adoptedAt: 1_000 },
    seeds: { basic: 2 },
    plantGrowth: null,
    ownedPlants: equippedPlant === null ? [] : [equippedPlant],
    equipment:
      equippedPlant === null
        ? { status: 'unequipped' }
        : { status: 'equipped', plantId: equippedPlant },
  }
}

function serviceReturning(result: ShareResult): RockShareService {
  return { share: vi.fn().mockResolvedValue(result) }
}

describe('rock share model', () => {
  it('reflects the current rock, name, and equipped plant', () => {
    const model = createRockShareModel(gameState('plant-02'))

    expect(model).toEqual({
      rock: { id: 'rock-03', name: '몽돌' },
      plant: { id: 'plant-02', displayName: '식물 2', assetKey: 'plant-02' },
    })
    expect(createRockShareText(model)).toContain('몽돌')
    expect(createRockShareText(model)).toContain('rock-03')
    expect(createRockShareText(model)).toContain('식물 2')
  })

  it('reflects the unequipped state', () => {
    const model = createRockShareModel(gameState())

    expect(model.plant).toBeNull()
    expect(createRockShareText(model)).toContain('머리 위 식물: 없음')
  })
})

describe('Apps in Toss sharing', () => {
  it('creates an official link and sends one text message', async () => {
    const shareApi: AppsInTossShareApi = {
      createLink: vi.fn().mockResolvedValue('https://toss.im/share/pet-rock'),
      sendMessage: vi.fn().mockResolvedValue(undefined),
    }
    const state = gameState('plant-02')
    const before = structuredClone(state)

    await expect(createAppsInTossShareService(shareApi).share(createRockShareModel(state)))
      .resolves.toEqual({ status: 'shared' })
    expect(shareApi.createLink).toHaveBeenCalledWith({ path: ROCK_SHARE_DEEP_LINK })
    expect(shareApi.sendMessage).toHaveBeenCalledWith({
      message:
        '내 애완돌을 소개할게요.\n이름: 몽돌\n돌: rock-03\n머리 위 식물: 식물 2\nhttps://toss.im/share/pet-rock',
    })
    expect(state).toEqual(before)
  })

  it.each(['createLink', 'sendMessage'] as const)('%s failure returns failed', async (method) => {
    const shareApi: AppsInTossShareApi = {
      createLink: vi.fn().mockResolvedValue('https://toss.im/share/pet-rock'),
      sendMessage: vi.fn().mockResolvedValue(undefined),
    }
    vi.mocked(shareApi[method]).mockRejectedValueOnce(new Error('bridge failed'))

    await expect(createAppsInTossShareService(shareApi).share(createRockShareModel(gameState())))
      .resolves.toEqual({ status: 'failed' })
  })
})

describe('browser fallback', () => {
  it('shares text and the current browser link when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const service = createBrowserShareService({ share }, 'https://example.com/pet-rock')

    await expect(service.share(createRockShareModel(gameState()))).resolves.toEqual({
      status: 'shared',
    })
    expect(share).toHaveBeenCalledWith({
      text: '내 애완돌을 소개할게요.\n이름: 몽돌\n돌: rock-03\n머리 위 식물: 없음',
      url: 'https://example.com/pet-rock',
    })
  })

  it('maps AbortError to cancelled and other errors to failed', async () => {
    const cancelledShare = vi.fn().mockRejectedValue(
      Object.assign(new Error('cancelled'), { name: 'AbortError' }),
    )
    const failedShare = vi.fn().mockRejectedValue(new Error('blocked'))

    await expect(
      createBrowserShareService({ share: cancelledShare }, 'https://example.com').share(
        createRockShareModel(gameState()),
      ),
    ).resolves.toEqual({ status: 'cancelled' })
    await expect(
      createBrowserShareService({ share: failedShare }, 'https://example.com').share(
        createRockShareModel(gameState()),
      ),
    ).resolves.toEqual({ status: 'failed' })
  })

  it('returns unavailable without Web Share capability or a browser URL', async () => {
    const model = createRockShareModel(gameState())

    await expect(createBrowserShareService({}, 'https://example.com').share(model)).resolves.toEqual({
      status: 'unavailable',
    })
    await expect(createBrowserShareService({ share: vi.fn() }, undefined).share(model))
      .resolves.toEqual({ status: 'unavailable' })
  })

  it('returns unavailable outside a secure context', async () => {
    const share = vi.fn()

    await expect(
      createBrowserShareService({ share }, 'http://example.com', false).share(
        createRockShareModel(gameState()),
      ),
    ).resolves.toEqual({ status: 'unavailable' })
    expect(share).not.toHaveBeenCalled()
  })
})

describe('share service routing', () => {
  it('detects Apps in Toss and Sandbox by the native bridge', () => {
    expect(isAppsInTossRuntime({ ReactNativeWebView: {} })).toBe(true)
    expect(isAppsInTossRuntime({})).toBe(false)
    expect(isAppsInTossRuntime(undefined)).toBe(false)
  })

  it('uses only the adapter selected for the runtime', async () => {
    const appsInToss = serviceReturning({ status: 'shared' })
    const browser = serviceReturning({ status: 'unavailable' })
    const model = createRockShareModel(gameState())

    await expect(
      createRockShareService({ isAppsInToss: true, appsInToss, browser }).share(model),
    ).resolves.toEqual({ status: 'shared' })
    expect(appsInToss.share).toHaveBeenCalledWith(model)
    expect(browser.share).not.toHaveBeenCalled()
  })

  it('uses the browser adapter outside Apps in Toss', async () => {
    const appsInToss = serviceReturning({ status: 'failed' })
    const browser = serviceReturning({ status: 'shared' })
    const model = createRockShareModel(gameState())

    await expect(
      createRockShareService({ isAppsInToss: false, appsInToss, browser }).share(model),
    ).resolves.toEqual({ status: 'shared' })
    expect(browser.share).toHaveBeenCalledWith(model)
    expect(appsInToss.share).not.toHaveBeenCalled()
  })

  it.each([
    { status: 'shared' },
    { status: 'cancelled' },
    { status: 'unavailable' },
    { status: 'failed' },
  ] as const)('does not mutate GameState for $status', async (result) => {
    const state = gameState('plant-02')
    const before = structuredClone(state)

    await expect(shareRock(state, serviceReturning(result))).resolves.toEqual(result)
    expect(state).toEqual(before)
  })
})
