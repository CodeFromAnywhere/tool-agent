import { Keys } from "from-anywhere";
import * as React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { components } from "./openapi-types";
import { AgentOpenapiSchema } from "./schemas/agent-openapi.schema";

/**
 * If you don't have access to the `useStore` hook, maybe because you're doing something outside of react... you can directly use the storage with javascript using this function
 */
export const getItem = async (key: string) => {
  if (typeof window === "undefined") {
    return undefined;
  }
  if (!window.localStorage) {
    return;
  }
  const item = window.localStorage.getItem(key);
  return item ? JSON.parse(item) : undefined;
};

/**
 * ONLY web
 */
export const getItemSync = (key: string) => {
  if (typeof window === "undefined") {
    return undefined;
  }
  if (!window.localStorage) {
    return;
  }
  const item = window.localStorage.getItem(key);
  return item ? JSON.parse(item) : undefined;
};

/**
 * If you don't have access to the `useStore` hook, maybe because you're doing something outside of react... you can directly use the storage with javascript using this function
 *
 * BEWARE! Updating this won't update your react components!
 */
export const setItem = async (key: string, value: any) => {
  if (typeof window === "undefined") {
    return;
  }
  if (!window.localStorage) {
    return;
  }
  window.localStorage.setItem(key, JSON.stringify(value));
};

export type StoreConfig<T extends object> = {
  /**
   * If given, this will be the initial value
   */
  initialValues: T;
  /**
   If given, this will be the base-key for your storage item.  If not provided, there will be no base-key. 
   
   Please make sure your keys are not used by anything else to prevent unintended behavior!

   The storage key will become {baseKey}.{yourKey}

   DEPRECATED: I think it's better to just manually put a dot in your name. This only hides away the actual implementation, a baseKey isn't needed!
   */
  baseKey?: string;
  debug?: boolean;
};

//local variables
let debug = false;
let contexts: { [key: string]: React.Context<any> } = {};

const getStoreKey = (key: string, baseKey?: string) =>
  baseKey ? `${baseKey}.${key}` : key;
const contextKey = (key: string) => `${key}Context`;

export type UseStoreType<TStore> = <K extends Keys<TStore>>(
  key: K,
) => UseStoreResult<TStore[K]>;

export type UseStoreResult<T> = [
  T,
  (value: T) => Promise<void>,
  { hydrated: boolean },
];

const StoreContextProvider = <TStore extends object, K extends Keys<TStore>>({
  DynamicContext,
  children,
  config,
  storeKey,
}: {
  DynamicContext: React.Context<any>;
  children: any;
  config: StoreConfig<TStore>;
  storeKey: K;
}) => {
  const [hydrated, setHydrated] = useState(false);
  const [store, setStore] = useState<TStore[K]>(
    config?.initialValues[storeKey],
  ); //null or some object or string or whatever
  const baseKey = config?.baseKey;

  // On mount, get the current value from storage
  useEffect(() => {
    const fullKey = getStoreKey(storeKey, baseKey);
    getItem(fullKey).then((value) => {
      if (debug) {
        console.log(`Hydrated store for ${fullKey}:`, value);
      }
      setStore(value);
      setHydrated(true);
    });
  }, []);

  const initialValues = config?.initialValues;

  const useStoreHook: UseStoreType<TStore> = <K2 extends Keys<TStore>>(
    key: K2,
  ) => {
    const fullKey = getStoreKey(key, baseKey);

    const defaultValue = initialValues[key];
    // @ts-ignore
    const value: TStore[K2] =
      store !== undefined
        ? store
        : defaultValue !== undefined
          ? defaultValue
          : null;

    const dispatch: (value: TStore[K2]) => Promise<void> = async (value) => {
      //should do a deep equal here, and only set the store and item if the value actually has changed
      //@ts-ignore
      setStore(value);
      await setItem(fullKey, value);
    };

    return [value, dispatch, { hydrated }];
  };

  return (
    <DynamicContext.Provider value={useStoreHook}>
      {children}
    </DynamicContext.Provider>
  );
};

/**
 * Function to create the StoreProvider
 *
 * NB: this function uses a local variable on the main scope of javascript in order to create the Context components dynamically. Beware!
 */
export const createStoreProvider = <TStore extends object>(
  config: StoreConfig<TStore>,
) => {
  if (config.debug) {
    debug = config.debug;
  }
  if (debug) {
    console.log("Create StoreProvider");
  }

  const keys = Object.keys(config.initialValues || {}) as Keys<TStore>[];

  const newContext = keys.reduce((acc, key) => {
    const Context = React.createContext(null);
    return {
      ...acc,
      [contextKey(key)]: Context,
    };
  }, {});

  contexts = { ...contexts, ...newContext };

  // console.log({ keys, contexts });

  const MainProvider = ({ children }: { children: any }) =>
    keys.reduce((acc, key) => {
      const context = contexts[contextKey(key)];

      // console.log({ context });
      return (
        <StoreContextProvider
          config={config}
          storeKey={key}
          DynamicContext={context}
        >
          {acc}
        </StoreContextProvider>
      );
    }, children);

  const Component = ({ children }: { children: any }) => {
    return <MainProvider>{children}</MainProvider>;
  };

  return Component;
};

const getReactContext = (key: string) => contexts[contextKey(key)];

/**
 * Function to create a hook for accessing the store
 */
export const createUseStore = <TStore extends object | undefined | null>(
  initialValues: TStore,
) => {
  if (debug) {
    console.log("Create useStore");
  }
  const useStore = <K extends Keys<TStore>>(key: K) => {
    if (!initialValues) {
      throw new Error(`Got a weird initial value: ${initialValues}`);
    }
    if (!Object.keys(initialValues).includes(key)) {
      console.log(`Using undefined key in useStore: ${key}`);
      // throw new Error(`Using undefined key in useStore: ${key}`);
    }
    const context = getReactContext(key);
    if (!context) {
      throw new Error(
        `Failed loading the context with key: ${key}. Did you wrap your component/app with a StoreProvider?`,
      );
    }
    const useStoreHook = React.useContext<UseStoreType<TStore>>(context);

    const useStoreHookType = typeof useStoreHook;

    if (useStoreHookType !== "function") {
      console.log("wrong type", useStoreHook, context);
      console.error(
        `useStoreHookType for ${key} is ${useStoreHookType}... wtf?`,
      );
    }

    return useStoreHook?.(key);
  };
  return useStore;
};

/**

One function is all you need to make a new store!

Example:


```ts

import { createStore } from "react-with-native-store";
import { TypeA, TypeB } from "your-types";

export const writerInitialValues: {
  itemA: TypeA;
  itemB: TypeB;
} = {
  itemA: "",
  itemB: {},
};
export const yourPackageStore = createStore(writerInitialValues);


```

Simple as pie 🍰

 */
export const createStore = <K extends object>(initialValues: K) => {
  //console.log({ initialValues });

  return {
    StoreProvider: createStoreProvider({ initialValues: initialValues || {} }),
    useStore: createUseStore(initialValues || {}),
  };
};

const store = createStore({
  openaiSecretKey: "",
  agents: [],
} as { openaiSecretKey: string; agents: AgentOpenapiSchema[] });

export const StoreProvider = store.StoreProvider;
export const useStore = store.useStore;
