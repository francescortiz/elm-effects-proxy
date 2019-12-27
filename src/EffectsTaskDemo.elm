module EffectsTaskDemo exposing (..)

import Browser exposing (Document)
import EffectsTask
import Html exposing (Html, text)
import Http exposing (Error(..), Response(..))
import Json.Encode as E
import Task


type Msg
    = GotEffectResponse (Result Http.Error String)


type alias Flags =
    ()


type alias Model =
    {}


main =
    Browser.document
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


init : Flags -> ( Model, Cmd Msg )
init flags =
    ( {}
    , Cmd.batch
        [ Http.get
            { url = EffectsTask.prefix ++ "patch"
            , expect = Http.expectString GotEffectResponse
            }
        , Http.post
            { url = EffectsTask.prefix ++ "console.log"
            , body = Http.jsonBody (E.list E.string [ "Pep", "Josep" ])
            , expect = Http.expectString GotEffectResponse
            }
        , Http.post
            { url = EffectsTask.prefix ++ "document"
            , body = Http.jsonBody (E.list E.string [ "Pep", "Josep" ])
            , expect = Http.expectString GotEffectResponse
            }
        , Http.post
            { url = EffectsTask.prefix ++ "nothing.nothing"
            , body = Http.jsonBody (E.list E.string [ "Pep", "Josep" ])
            , expect = Http.expectString GotEffectResponse
            }
        , Http.post
            { url = EffectsTask.prefix ++ "asyncEcho"
            , body = Http.jsonBody (E.list E.string [ "Pep", "Josep" ])
            , expect = Http.expectString GotEffectResponse
            }
        , Task.attempt GotEffectResponse <|
            (Http.task
                { method = "POST"
                , headers = []
                , url = EffectsTask.prefix ++ "echo"
                , body = Http.jsonBody (E.list E.int [ 4 ])
                , resolver =
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
                , timeout = Nothing
                }
                |> Task.andThen
                    (\previousValue ->
                        if previousValue == "4" then
                            Http.task
                                { method = "POST"
                                , headers = []
                                , url = EffectsTask.prefix ++ "echo"
                                , body = Http.jsonBody (E.list E.string [ "Nice! We received the 4!" ])
                                , resolver =
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
                                , timeout = Nothing
                                }

                        else
                            Http.task
                                { method = "POST"
                                , headers = []
                                , url = EffectsTask.prefix ++ "echo"
                                , body = Http.jsonBody (E.list E.string [ "Shit! We didn't receive the 4!" ])
                                , resolver =
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
                                , timeout = Nothing
                                }
                    )
            )
        ]
    )


view : Model -> Document Msg
view model =
    { title = "Elm Effects Task Demo"
    , body = [ text "Effects task demo" ]
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    let
        _ =
            Debug.log "msg" msg
    in
    ( model, Cmd.none )


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none
