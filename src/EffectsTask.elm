module EffectsTask exposing (..)

import Http exposing (Error(..), Expect, Response(..))
import Json.Encode as E exposing (Value)
import Task exposing (Task)


prefix : String
prefix =
    "https://elm-effects-task.flexidao.com/"


cmd :
    Expect msg
    -> String
    -> List Value
    -> Cmd msg
cmd expect functionName arguments =
    let
        url =
            prefix ++ functionName
    in
    if List.length arguments == 0 then
        Http.get
            { url = url
            , expect = expect
            }

    else
        Http.post
            { url = url
            , body = Http.jsonBody (E.list identity arguments)
            , expect = expect
            }


task :
    { resolver : Http.Resolver x a
    , functionName : String
    , arguments : List Value
    , timeout : Maybe Float
    }
    -> Task x a
task { resolver, functionName, arguments, timeout } =
    Http.task
        { method =
            if List.length arguments == 0 then
                "GET"

            else
                "POST"
        , headers = []
        , url = prefix ++ functionName
        , body = Http.jsonBody (E.list identity arguments)
        , resolver = resolver
        , timeout = timeout
        }


simpleStringResolver : Http.Resolver Http.Error String
simpleStringResolver =
    Http.stringResolver
        (\response ->
            case response of
                BadUrl_ error ->
                    Err <| BadUrl error

                Timeout_ ->
                    Err <| Timeout

                NetworkError_ ->
                    Err <| NetworkError

                BadStatus_ metadata body ->
                    Err <| BadStatus metadata.statusCode

                GoodStatus_ metadata body ->
                    Ok body
        )
